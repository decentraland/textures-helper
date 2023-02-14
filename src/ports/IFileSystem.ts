import * as stream from 'stream'

export default interface IFileSystem {
  saveFile(file: string, data: ArrayBuffer): Promise<string>
  retrieveFile(file: string): Promise<Buffer>
  asReadable(file: string): stream.Readable
  deleteFile(file: string, options: { withSilentFail: boolean }): Promise<void>
}
