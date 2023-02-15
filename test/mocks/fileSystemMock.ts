import { createReadStream, ReadStream } from 'fs'
import IFileSystem from '../../src/ports/IFileSystem'
import * as os from 'os'

export function createFileSystemMock(): IFileSystem {
  const contentDirectory: string = os.tmpdir()

  async function saveFile(file: string, _data: ArrayBuffer): Promise<string> {
    return `${contentDirectory}/${file}`
  }

  async function retrieveFile(file: string): Promise<Buffer> {
    return Buffer.from(file)
  }

  function asReadable(file: string): ReadStream {
    return createReadStream(`${contentDirectory}/${file}`)
  }

  async function deleteFile(_file: string, _options: { withSilentFail: boolean }): Promise<void> {
    return
  }

  return { saveFile, retrieveFile, asReadable, deleteFile }
}
