import ProcessWrapper from './processWrapper'

export type CrunchConversionOptions = {
  fileFormat: string
  size?: number
  out?: string
}

export interface IAssetConverter {
  convert: (fileToConvert: string, options: CrunchConversionOptions) => ProcessWrapper
}
