import { promises as fs, createReadStream, ReadStream } from 'fs'
import IFileSystem from '../ports/IFileSystem'
import * as os from 'os'
import { AppComponents } from './../types'

export async function createFileSystemAdapter({
  config,
  logs
}: Pick<AppComponents, 'config' | 'logs'>): Promise<IFileSystem> {
  const contentDirectory: string = (await config.getString('STORAGE_DIRECTORY')) || `${os.tmpdir()}`
  const logger = logs.getLogger('fileSystem')
  logger.info('Setting file system adapter with', { contentDirectory })

  async function saveFile(file: string, data: ArrayBuffer): Promise<string> {
    await fs.writeFile(`${contentDirectory}/${file}`, Buffer.from(data))
    return `${contentDirectory}/${file}`
  }

  async function retrieveFile(file: string): Promise<Buffer> {
    return fs.readFile(`${contentDirectory}/${file}`)
  }

  function asReadable(file: string): ReadStream {
    return createReadStream(`${contentDirectory}/${file}`)
  }

  async function deleteFile(file: string, options: { withSilentFail: boolean }): Promise<void> {
    return fs.unlink(`${contentDirectory}/${file}`).catch((error) => {
      if (!options.withSilentFail) throw error

      logger.error('Process fail while deleting a file', { file })
    })
  }

  return { saveFile, retrieveFile, asReadable, deleteFile }
}
