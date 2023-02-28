import { HandlerContextWithPath } from '../../types'
import { ResizeRatio } from '../../types/resize-ratio-calculator'
import { ConversionResult } from '../../types/asset-converter'
import { DecentralandSignatureContext } from 'decentraland-crypto-middleware/lib/types'

import { createHash } from 'crypto'

// check using bit representation
function isPowerOfTwo(length: number): boolean {
  return length >= 128 && length <= 2048 && (length & (length - 1)) === 0
}

function areInvalid(pathParameters: { length: string }): boolean {
  const lengthAsNumber = Number(pathParameters.length)
  return !pathParameters.length || isNaN(lengthAsNumber) || !isPowerOfTwo(lengthAsNumber)
}

function isMissing(metadata: Record<string, any>): boolean {
  return metadata.signer !== 'dcl:explorer' || metadata.intent !== 'dcl:explorer:resize-textures'
}

export async function resizeHandler(
  context: HandlerContextWithPath<
    'storages' | 'logs' | 'assetConverter' | 'assetRetriever' | 'resizeRatioCalculator',
    '/content/dxt/:length'
  > &
    DecentralandSignatureContext<any>
) {
  const {
    components: { storages, logs, assetConverter, assetRetriever, resizeRatioCalculator },
    params,
    url
  } = context

  const logger = logs.getLogger('resize-handler')

  const assetUrl = url.searchParams.get('asset')

  logger.info('Processing with', { asset: assetUrl || '', length: params.length })

  if (isMissing(context.verification!.authMetadata)) {
    return {
      status: 400,
      body: {
        message: 'Access denied, invalid metadata.'
      }
    }
  }

  if (areInvalid(params)) {
    return {
      status: 400,
      body: {
        message: 'The path parameter length is required. Length must be a power of two between 128 and 2048.'
      }
    }
  }

  if (!assetUrl) {
    return {
      status: 400,
      body: {
        message:
          'The query string parameter asset is required. Asset must be a valid URL aiming to the image to convert.'
      }
    }
  }

  try {
    const asset: ArrayBuffer = await assetRetriever.get(assetUrl)

    if (!asset || !asset.byteLength) {
      return {
        status: 404,
        body: {
          message: `Asset on ${assetUrl} could not be downloaded.`
        }
      }
    }

    const hashFromUrl = createHash('sha256').update(assetUrl).digest('hex')
    const assetName = hashFromUrl.substring(0, 10)

    const originalAssetName = `${assetName}.png`
    const convertedAssetName = `${assetName}.crn`
    const assetToUploadName = `${params.length}-${assetName}.crn`

    // in case the asset is not an image, fails with: Error: Invalid image buffer
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
