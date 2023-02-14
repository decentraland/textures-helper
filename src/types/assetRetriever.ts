export interface IAssetRetriever {
  getAsset: (hash: string) => Promise<ArrayBuffer>
}
