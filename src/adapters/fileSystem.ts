import * as fs from 'fs'
import IFileSystem from '../ports/IFileSystem'

export function createFileManager(contentDirectory: string): IFileSystem {
  function saveFile(file: string, data: ArrayBuffer) {
    fs.writeFileSync(`${contentDirectory}/${file}`, Buffer.from(data))
    return `${contentDirectory}/${file}`
  }

  function retrieveFile(file: string): Buffer {
    return fs.readFileSync(`${contentDirectory}/${file}`)
  }

  function asReadable(file: string): fs.ReadStream {
    return fs.createReadStream(`${contentDirectory}/${file}`)
  }

  function deleteFile(file: string): void {
    return fs.unlinkSync(`${contentDirectory}/${file}`)
  }

  return { saveFile, retrieveFile, asReadable, deleteFile }
}
