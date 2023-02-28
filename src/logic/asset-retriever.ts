import { IAssetRetriever } from '../types/asset-retriever'
import { AppComponents } from '../types'

export default async function createAssetRetriever({ fetch }: Pick<AppComponents, 'fetch'>): Promise<IAssetRetriever> {
  async function get(assetUrl: string): Promise<ArrayBuffer> {
    return await (await fetch.fetch(assetUrl)).arrayBuffer()
  }

  return { get }
}
