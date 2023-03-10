import ICommandLine from '../ports/ICommandTrigger'
import { AppComponents } from '../types'
import { ConversionResult, CrunchConversionOptions, IAssetConverter } from '../types/asset-converter'

export default function createAssetConverter(
  { metrics }: Pick<AppComponents, 'metrics'>,
  commandTrigger: ICommandLine
): IAssetConverter {
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

    const metricLabels = { size: Number(options.size) }
    const metricTimer = metrics.startTimer('conversion_duration_seconds', metricLabels)

    try {
      return await commandTrigger.execute('crunch', args)
    } finally {
      metricTimer.end(metricLabels)
    }
  }

  return { convert }
}
