import { ConversionResult } from '../types/asset-converter'

export default interface ICommandLine {
  execute(command: string, args: string[]): Promise<ConversionResult>
}
