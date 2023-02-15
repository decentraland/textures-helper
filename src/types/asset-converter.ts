export type ConversionResult = {
  code: number
  failed: boolean
}

export type CrunchConversionOptions = {
  fileFormat: string
  size?: number
  out?: string
}

export interface IAssetConverter {
  convert: (fileToConvert: string, options: CrunchConversionOptions) => Promise<ConversionResult>
}
