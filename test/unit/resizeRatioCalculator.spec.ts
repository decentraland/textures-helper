import { IResizeRatioCalculator } from '../../src/types/asset-analyzer'
import createResizeRatioCalculator from '../../src/logic/resizeRatioCalculator'
import { PNG } from 'pngjs'

describe('resizeRatioCalculator', () => {
  let sut: IResizeRatioCalculator

  beforeAll(() => {
    sut = createResizeRatioCalculator()
  })

  describe('calculate should', () => {
    let mockImage: ArrayBuffer

    beforeAll(() => {
      const image = new PNG({ width: 128, height: 246 })
      const buffer = PNG.sync.write(image)
      mockImage = new Uint8Array(buffer).buffer
    })

    test('calculate height and width ratio correctly', () => {
      const r = sut.calculate(mockImage, 512)

      expect(r.height).toBe(2.0813)
      expect(r.width).toBe(4)
      expect(r.originalType).toBe('png')
    })
  })
})
