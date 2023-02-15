import { HandlerContextWithPath } from '../../types'
import { AssetMetadata } from '../../types/asset-analyzer'

// check using bit representation
function isPowerOfTwo(length: number): boolean {
  return length >= 128 && length <= 2048 && (length & (length - 1)) === 0
}

export async function resizeHandler({
  params,
  components: { storages, logs, assetConverter, assetRetriever, assetAnalyzer }
}: Pick<
  HandlerContextWithPath<'storages' | 'logs' | 'assetConverter' | 'assetRetriever' | 'assetAnalyzer'>,
  'components' | 'params'
>) {
  const logger = logs.getLogger('resize-handler')

  logger.info('Processing with', { hash: params.hash, length: params.length })

  if (!params.hash || !params.length || isNaN(Number(params.length)) || !isPowerOfTwo(params.length)) {
    return {
      status: 400,
      body: {
        message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
      }
    }
  }

  const originalAssetName = `${params.hash}.png`
  const convertedAssetName = `${params.hash}.crn`
  const assetToUploadName = `${params.hash}-${params.length}.crn`

  try {
    const asset: ArrayBuffer = await assetRetriever.getAsset(params.hash)

    if (!asset || !asset.byteLength) {
      return {
        status: 404,
        body: {
          message: `Asset with hash ${params.hash} could not be found.`
        }
      }
    }

    const assetMetadata: AssetMetadata = assetAnalyzer.getMetadata(asset)
    const fileToConvert = await storages.local.saveFile(originalAssetName, asset)

    const conversionResult = await assetConverter.convert(fileToConvert, {
      fileFormat: 'crn',
      size: Number(params.length),
      out: convertedAssetName
    })

    if (conversionResult.failed) {
      return { status: 400, body: { message: 'Conversion process failed.' } }
    }

    const assetURL = await storages.bucket.upload(assetToUploadName, storages.local.asReadable(convertedAssetName))

    await storages.local.deleteFile(originalAssetName, { withSilentFail: true })
    await storages.local.deleteFile(convertedAssetName, { withSilentFail: true })

    return {
      status: 200,
      body: {
        asset: assetURL,
        heightRatio: params.length / (assetMetadata.height ? assetMetadata.height : 1),
        widthRatio: params.length / (assetMetadata.width ? assetMetadata.width : 1)
      }
    }
  } catch (error: any) {
    logger.error('Process failed', { error: error.message })
    return { status: 400, body: { message: 'Process failed.' } }
  }
}
