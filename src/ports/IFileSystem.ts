import stream = require('stream')

export default interface IFileSystem {
  saveFile(file: string, data: ArrayBuffer): string
  retrieveFile(file: string): Buffer
  asReadable(file: string): stream.Readable
  deleteFile(file: string): void
}
