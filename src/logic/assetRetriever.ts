import { createFetchComponent } from '../adapters/fetch'

export default async function createAssetRetriever(
  contentHost: string
): Promise<(hash: string) => Promise<ArrayBuffer>> {
  const fetcher = await createFetchComponent()

  const getAsset = async (hash: string): Promise<ArrayBuffer> => {
    return await (await fetcher.fetch(`${contentHost}/contents/${hash}`)).arrayBuffer()
  }

  return getAsset
}
