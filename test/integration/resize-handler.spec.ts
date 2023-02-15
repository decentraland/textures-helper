import { test } from '../components'

test('resize handler /content/:hash/dxt/:length', function ({ components, spyComponents }) {
  it('fails when length sent is not a power of two', async () => {
    const { localFetch } = components

    const r = await localFetch.fetch('/content/aHash/dxt/201')

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is not a number', async () => {
    const { localFetch } = components

    const r = await localFetch.fetch('/content/aHash/dxt/length')

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is greater than 2048', async () => {
    const { localFetch } = components

    const r = await localFetch.fetch('/content/aHash/dxt/4096')

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when length is less than 128', async () => {
    const { localFetch } = components

    const r = await localFetch.fetch('/content/aHash/dxt/64')

    expect(r.status).toEqual(400)
    expect(await r.json()).toEqual({
      message: 'The parameters hash and length are required. Length must be a power of two between 128 and 2048.'
    })
  })

  it('fails when asset is not found by the hash provided', async () => {
    const hash = 'aHash'
    const { localFetch } = components
    spyComponents.assetRetriever.getAsset.mockResolvedValueOnce(undefined)

    const r = await localFetch.fetch(`/content/${hash}/dxt/128`)

    expect(r.status).toBe(404)
    expect(await r.json()).toEqual({
      message: `Asset with hash ${hash} could not be found.`
    })
  })
})
