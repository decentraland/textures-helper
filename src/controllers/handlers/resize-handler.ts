import { ILoggerComponent } from '@well-known-components/interfaces'
import { HandlerContextWithPath } from '../../types'

const silentError = (logger: ILoggerComponent.ILogger, nameOfAction: string) => (error: Error) => {
  logger.error('Process failed while ' + nameOfAction, { error: error.message })
}

export async function resizeHandler(
  context: HandlerContextWithPath<
    'storages' | 'assetConverter' | 'assetRetriever' | 'config' | 'logs' | 'cdnS3',
    '/content/:hash/dxt/:length'
  >
) {
  const {
    components: { storages, assetConverter, assetRetriever, config, logs, cdnS3 },
    params
  } = context
  const logger = logs.getLogger('resize-handler')

  const { hash: assetHash, length: lengthRequired } = params

  if (!assetHash || !lengthRequired || isNaN(Number(lengthRequired))) return { status: 400 }

  const sizeBelow8K = lengthRequired <= 8 * 1024
  const isPowerOfTwo = Math.pow(2, Math.floor(Math.log(lengthRequired) / Math.log(2)))) === lengthRequired
  if (!sizeBelow8K || !isPowerOfTwo) {
    return { status: 406 }
  }

  logger.info('Processing with', { assetHash, lengthRequired })

  const originalAssetName = `${assetHash}.png`
  const convertedAssetName = `${assetHash}.crn`
  const assetToUploadName = `${assetHash}-${lengthRequired}.crn`

  try {
    const asset: ArrayBuffer = await assetRetriever(assetHash)

    if (!asset) {
      return { status: 404 }
    }

    const fileToConvert = await storages.local.saveFile(originalAssetName, asset)

    const conversionProcesss = assetConverter.convert(fileToConvert, {
      fileFormat: 'crn',
      size: Number(lengthRequired),
      out: convertedAssetName
    })

    conversionProcesss.onError((data: Buffer) => {
      logger.error('Conversion process failed', { data: data.toString() })
    })

    const conversionResult: { code: number; failed: boolean } = await new Promise((resolve) => {
      conversionProcesss.onEnd((code: number) => {
        logger.info('Process finished', { code })
        resolve({ code, failed: code != 0 })
      })
    })

    await storages.local.deleteFile(originalAssetName).catch(silentError(logger, 'deleting ' + originalAssetName))

    if (conversionResult.failed) {
      return { status: 400 }
    }

    const bucket = await config.getString('BUCKET')
    await cdnS3
      .upload({
        Bucket: bucket as string,
        Key: assetToUploadName,
        Body: storages.local.asReadable(convertedAssetName),
        CacheControl: 'max-age=3600,s-maxage=3600',
        ACL: 'public-read'
      })
      .promise()

    await storages.local.deleteFile(convertedAssetName).catch(silentError(logger, 'deleting ' + convertedAssetName))

    return {
      body: { asset: `${await config.getString('BUCKET_DOMAIN')}${assetToUploadName}` }
    }
  } catch (error: any) {
    logger.error('Process failed', { error: error.message })
    logger.debug('Detailed error', { errorDetails: error.toString() })

    return { status: 400 }
  }
}
