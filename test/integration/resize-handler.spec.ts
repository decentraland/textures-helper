import { test } from '../components'
import { getAuthHeaders, getIdentity } from '../utils'
import { Authenticator } from '@dcl/crypto'

test('resize handler /content/:hash/dxt/:length', function ({ components, spyComponents }) {
  it('fails when auth chain is missing', async () => {
    const { localFetch } = components

    const path = '/content/dxt/148?asset=aHash'

    const r = await localFetch.fetch(path)

    expect(r.status).toEqual(400)
    expect(await r.json()).toMatchObject({
      message: 'Invalid Auth Chain'
    })
  })

  it('fails when auth chain is present but metadata.intent is invalid', async () => {
    const { localFetch } = components

    const path = '/content/dxt/128'
    const request = await getSignedFetchRequest(path, { intent: 'invalid', signer: VALID_CUSTOM_METADATA.signer })

    const r = await localFetch.fetch(path + '?asset=aHash', {
      ...request,
      headers: { ...request.headers, metadata: { ...request.headers.metadata, intent: 'invalid' } }
    })

    expect(r.status).toEqual(400)
    expect(await r.json()).toMatchObject({
      message: 'Access denied, invalid metadata.'
    })
  })

  it('fails when auth chain is present but metadata.signer is invalid', async () => {
    const { localFetch } = components

    const path = '/content/dxt/128'
    const request = await getSignedFetchRequest(path, { intent: VALID_CUSTOM_METADATA.intent, signer: 'invalid' })

    const r = await localFetch.fetch(path + '?asset=aHash', {
      ...request,
      headers: { ...request.headers, metadata: { ...request.headers.metadata, intent: 'invalid' } }
    })

    expect(r.status).toEqual(400)
    expect(await r.json()).toMatchObject({
      message: 'Access denied, invalid metadata.'
    })
  })

  it('fails when length sent is not a power of two', async () => {
    const { localFetch } = components

    const path = '/content/dxt/201'
    const request = await getSignedFetchRequest(path)

    const r = await localFetch.fetch(path + '?asset=aHash', request)

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is not a number', async () => {
    const { localFetch } = components

    const path = '/content/dxt/length'
    const request = await getSignedFetchRequest(path)

    const r = await localFetch.fetch(path + '?asset=aHash', request)

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is greater than 2048', async () => {
    const { localFetch } = components

    const path = '/content/dxt/4096'
    const request = await getSignedFetchRequest(path)

    const r = await localFetch.fetch(path + '?asset=aHash', request)

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is less than 128', async () => {
    const { localFetch } = components

    const path = '/content/dxt/64'
    const request = await getSignedFetchRequest(path)

    const r = await localFetch.fetch(path + '?asset=aHash', request)

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when asset is not found by the hash provided', async () => {
    const { localFetch } = components

    const hash = 'aHash'
    const path = `/content/dxt/128`
    const request = await getSignedFetchRequest(path)
    spyComponents.assetRetriever.get.mockResolvedValueOnce(undefined)

    const r = await localFetch.fetch(path + `?asset=${hash}`, request)

    expect(r.status).toBe(404)
    expect(await r.json()).toEqual({
      message: `Asset on ${hash} could not be downloaded.`
    })
  })
})

const VALID_CUSTOM_METADATA = {
  intent: 'dcl:explorer:resize-textures',
  signer: 'dcl:explorer'
}

async function getSignedFetchRequest(
  path: string,
  customMetadata: { intent: string; signer: string } = VALID_CUSTOM_METADATA
): Promise<{ method: string; headers: any }> {
  const identity = await getIdentity()
  return {
    method: 'GET',
    headers: {
      ...getAuthHeaders(
        'GET',
        path,
        {
          origin: 'https://play.decentraland.org',
          intent: customMetadata.intent,
          signer: customMetadata.signer,
          isGuest: 'false'
        },
        (payload) => {
          return Authenticator.signPayload(
            {
              ephemeralIdentity: identity.ephemeralIdentity,
              expiration: new Date(),
              authChain: identity.authChain.authChain
            },
            payload
          )
        }
      )
    }
  }
}
