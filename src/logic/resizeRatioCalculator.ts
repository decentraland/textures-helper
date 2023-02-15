import { ResizeRatio, IResizeRatioCalculator } from '../types/asset-analyzer'
import sizeOf from 'image-size'

export default function createResizeRatioCalculator(): IResizeRatioCalculator {
  function calculate(file: ArrayBuffer, newSizeSquare: number): ResizeRatio {
    const assetMetadata = sizeOf(Buffer.from(file))

    return {
      width: Number((newSizeSquare / (assetMetadata.width ? assetMetadata.width : 1)).toFixed(4)),
      height: Number((newSizeSquare / (assetMetadata.height ? assetMetadata.height : 1)).toFixed(4)),
      originalType: assetMetadata.type
    }
  }

  return { calculate }
}
