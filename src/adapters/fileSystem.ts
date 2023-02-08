import { promises as fs, createReadStream, ReadStream } from 'fs'
import IFileSystem from '../ports/IFileSystem'

export function createFileManager(contentDirectory: string): IFileSystem {
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

  async function deleteFile(file: string): Promise<void> {
    return fs.unlink(`${contentDirectory}/${file}`)
  }

  return { saveFile, retrieveFile, asReadable, deleteFile }
}
