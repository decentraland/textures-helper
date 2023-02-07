import ICommandTrigger from '../ports/ICommandTrigger'
import { CrunchConversionDefaultOptions, CrunchConversionOptions } from '../types/crunch-conversion'
import ProcessWrapper from '../types/processWrapper'

export class Conversion {
  private filePath: string
  private options?: CrunchConversionOptions

  constructor(filePath: string) {
    this.filePath = filePath
  }

  setOptions(options: CrunchConversionOptions): void {
    this.options = options
  }

  getArguments(): string[] {
    const addIfRequired = (condition: boolean, argToAdd: string, args: string[]): string[] => {
      return condition ? [...args, argToAdd] : args
    }

    const applyOptionals = (requiredArgs: string[]): string[] => {
      const fileSizeArgument = `-rescale ${this.options?.size} ${this.options?.size}`
      const outArgument = `-out ${this.options?.out}`
      const withSizeIfApplies = addIfRequired(!!this.options?.size, fileSizeArgument, requiredArgs)
      return addIfRequired(!!this.options?.out, outArgument, withSizeIfApplies)
    }

    const filePathArgument = `-file ${this.filePath}`
    const fileFormatArgument = `-fileformat ${this.options?.fileFormat}`
    const textureFormatArgument = `-${this.options?.textureFormat}`

    const requiredArguments = [filePathArgument, fileFormatArgument, textureFormatArgument]

    return applyOptionals(requiredArguments)
  }

  executeWith(commandTrigger: ICommandTrigger): ProcessWrapper {
    this.getArguments().forEach(commandTrigger.addArgument)
    return commandTrigger.execute('crunch')
  }
}

export class ConversionBuilder {
  private options: CrunchConversionOptions
  private destinationDirectory: string

  constructor(destinationDirectory: string, defaultOptions?: CrunchConversionOptions) {
    this.destinationDirectory = destinationDirectory
    this.options = defaultOptions || CrunchConversionDefaultOptions
  }

  withAdjustedSize(size: number): ConversionBuilder {
    this.options.size = size
    return this
  }

  setTexturesFormat(texturesFormat: string): ConversionBuilder {
    this.options.textureFormat = texturesFormat
    return this
  }

  setConversionFormat(format: string): ConversionBuilder {
    this.options.fileFormat = format
    return this
  }

  setDestination(file: string): ConversionBuilder {
    this.options.out = `${this.destinationDirectory}/${file}`
    return this
  }

  buildConversion(filePath: string, destFormat: string): Conversion {
    this.options.fileFormat = destFormat
    const conversion = new Conversion(filePath)
    conversion.setOptions(this.options)
    return conversion
  }
}

export function createConversionBuilder(destinationDirectory: string) {
  return new ConversionBuilder(destinationDirectory)
}
