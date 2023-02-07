import { HandlerContextWithPath } from '../../types'

import createCommandTrigger from '../../adapters/commandLine'

export async function resizeHandler(
  context: HandlerContextWithPath<
    'storages' | 'conversionBuilder' | 'assetRetriever' | 'config' | 'logs',
    '/content/:hash/dxt/:length'
  >
) {
  const {
    components: { storages, conversionBuilder, assetRetriever, config, logs },
    params
  } = context
  const logger = logs.getLogger('resize-handler')

  const assetHash = params.hash
  const lengthRequired = params.length

  if (!assetHash || !lengthRequired) return { status: 400 }

  logger.info(`Processing with ${JSON.stringify({ assetHash, lengthRequired })}`)

  const originalAssetName = `${assetHash}.png`
  const convertedAssetName = `${assetHash}.crn`
  const assetToUploadName = `${assetHash}-${lengthRequired}.crn`

  if (!(await storages.bucket.exist(assetToUploadName))) {
    const asset: ArrayBuffer = await assetRetriever(assetHash)

    if (!asset) {
      return { status: 404 }
    }

    const filePath = storages.local.saveFile(originalAssetName, asset)

    const conversionProcesss = conversionBuilder
      .setDestination(convertedAssetName)
      .withAdjustedSize(Number(lengthRequired))
      .buildConversion(filePath, 'crn')
      .executeWith(createCommandTrigger())

    conversionProcesss.onError((data: Buffer) => {
      logger.error(`Process failed with: ${data.toString()}`)
    })

    await new Promise((resolve) => {
      conversionProcesss.onEnd((code: number) => {
        logger.info(`Process finished with code ${code}`)
        resolve(code)
      })
    })

    await storages.bucket.storeStream(assetToUploadName, storages.local.asReadable(convertedAssetName))
    storages.local.deleteFile(originalAssetName)
    storages.local.deleteFile(convertedAssetName)
  }

  return {
    body: { asset: `${await config.getString('BUCKET')}/${assetToUploadName}` }
  }
}
