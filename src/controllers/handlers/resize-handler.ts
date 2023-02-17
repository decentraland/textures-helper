import { HandlerContextWithPath } from '../../types'
import { ResizeRatio } from '../../types/resize-ratio-calculator'
import { ConversionResult } from '../../types/asset-converter'
import { DecentralandSignatureContext } from 'decentraland-crypto-middleware/lib/types'

// check using bit representation
function isPowerOfTwo(length: number): boolean {
  return length >= 128 && length <= 2048 && (length & (length - 1)) === 0
}

function areNotValid(pathParameters: { hash: string; length: string }): boolean {
  const lengthAsNumber = Number(pathParameters.length)
  return !pathParameters.hash || !pathParameters.length || isNaN(lengthAsNumber) || !isPowerOfTwo(lengthAsNumber)
}

function isMissing(metadata: Record<string, any>): boolean {
  return metadata.signer !== 'dcl:explorer' || metadata.intent !== 'dcl:explorer:resize-textures'
}

export async function resizeHandler(
  context: HandlerContextWithPath<
    'storages' | 'logs' | 'assetConverter' | 'assetRetriever' | 'resizeRatioCalculator',
    '/content/:hash/dxt/:length'
  > &
    DecentralandSignatureContext<any>
) {
  const {
    components: { storages, logs, assetConverter, assetRetriever, resizeRatioCalculator },
    params
  } = context

  const logger = logs.getLogger('resize-handler')

  logger.info('Processing with', { hash: params.hash, length: params.length })

  if (isMissing(context.verification!.authMetadata)) {
    return {
      status: 400,
      body: {
        message: 'Access denied, invalid metadata.'
      }
    }
  }

  if (areNotValid(params)) {
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

    const resizeRatio: ResizeRatio = resizeRatioCalculator.calculate(asset, Number(params.length))
    const fileToConvert: string = await storages.local.saveFile(originalAssetName, asset)

    const conversionResult: ConversionResult = await assetConverter.convert(fileToConvert, {
      fileFormat: 'crn',
      size: Number(params.length),
      out: convertedAssetName
    })

    if (conversionResult.failed) {
      return { status: 400, body: { message: 'Conversion process failed.' } }
    }

    const assetURL: string = await storages.bucket.upload(
      assetToUploadName,
      storages.local.asReadable(convertedAssetName)
    )

    await storages.local.deleteFile(originalAssetName, { withSilentFail: true })
    await storages.local.deleteFile(convertedAssetName, { withSilentFail: true })

    return {
      status: 200,
      body: {
        asset: assetURL,
        conversionRatio: {
          height: resizeRatio.height,
          width: resizeRatio.width
        }
      }
    }
  } catch (error: any) {
    logger.error('Process failed', { error: error.message })
    return { status: 400, body: { message: 'Process failed.' } }
  }
}
