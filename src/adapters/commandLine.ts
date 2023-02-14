import { spawn } from 'child_process'
import ICommandLine from '../ports/ICommandTrigger'
import { AppComponents } from './../types'
import { ConversionResult } from '../types/asset-converter'

export default async function createCommandLineAdapter({ logs }: Pick<AppComponents, 'logs'>): Promise<ICommandLine> {
  const logger = logs.getLogger('commandLineAdapter')

  function execute(command: string, args: string[]): Promise<ConversionResult> {
    const process = spawn(command, args)

    process.stderr?.on('data', (data: Buffer) => {
      logger.error('Conversion process failed', { data: data.toString() })
    })

    return new Promise((resolve) => {
      process.on('close', (code: number) => {
        logger.info('Conversion process finished', { code })
        resolve({ code, failed: code != 0 })
      })
    })
  }

  return { execute }
}
