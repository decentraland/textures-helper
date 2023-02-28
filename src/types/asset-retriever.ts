export interface IAssetRetriever {
  get: (hash: string) => Promise<ArrayBuffer>
}
