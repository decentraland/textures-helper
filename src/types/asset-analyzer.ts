export type AssetMetadata = {
  width?: number
  height?: number
  type?: string
}

export interface IAssetAnalyzer {
  getMetadata: (file: ArrayBuffer) => AssetMetadata
}
