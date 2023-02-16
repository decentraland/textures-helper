export type ResizeRatio = {
  width: number
  height: number
  originalType?: string
}

export interface IResizeRatioCalculator {
  calculate: (file: ArrayBuffer, newSizeSquare: number) => ResizeRatio
}
