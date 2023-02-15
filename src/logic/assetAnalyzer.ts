import { AssetMetadata, IAssetAnalyzer } from '../types/asset-analyzer'

import sizeOf from 'image-size'

export default function createAssetAnalyzer(): IAssetAnalyzer {
  function getMetadata(file: ArrayBuffer): AssetMetadata {
    return sizeOf(Buffer.from(file))
  }

  return { getMetadata }
}
