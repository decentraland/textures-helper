import * as stream from 'stream'

export default interface ICDNBucket {
  upload(fileName: string, file: stream.Readable): Promise<string>
}
