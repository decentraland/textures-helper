export const CrunchConversionDefaultOptions: CrunchConversionOptions = {
  fileFormat: 'crn',
  textureFormat: 'dxt1',
  size: undefined
}

export type CrunchConversionOptions = {
  fileFormat: string
  textureFormat: string
  size?: number
  out?: string
}
