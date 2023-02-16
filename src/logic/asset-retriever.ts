import { IAssetRetriever } from '../types/asset-retriever'
import { AppComponents } from '../types'

export default async function createAssetRetriever({
  config,
  fetch
}: Pick<AppComponents, 'config' | 'fetch'>): Promise<IAssetRetriever> {
  const contentHost = (await config.getString('CONTENT_URL')) || ''

  async function getAsset(hash: string): Promise<ArrayBuffer> {
    return await (await fetch.fetch(`${contentHost}/contents/${hash}`)).arrayBuffer()
  }

  return { getAsset }
}
