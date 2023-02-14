import ICommandLine from '../ports/ICommandTrigger'
import { ConversionResult, CrunchConversionOptions, IAssetConverter } from '../types/asset-converter'

export default function createAssetConverter(commandTrigger: ICommandLine): IAssetConverter {
  function getArguments(filePath: string, options: CrunchConversionOptions): string[] {
    const args: string[] = []
    args.push('-outsamedir')
    args.push('-file', filePath)
    args.push('-fileformat', options.fileFormat)
    args.push('-dxt1')

    if (!!options.size) {
      args.push('-rescale', `${options.size} ${options.size}`)
    }

    if (!!options.out) {
      args.push('-out', options.out as string)
    }

    return args
  }

  async function convert(fileToConvert: string, options: CrunchConversionOptions): Promise<ConversionResult> {
    const args = getArguments(fileToConvert, options)
    return commandTrigger.execute('crunch', args)
  }

  return { convert }
}
