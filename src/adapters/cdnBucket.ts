import * as AWS from 'aws-sdk'
import * as MockAws from 'mock-aws-s3'
import * as stream from 'stream'
import { AppComponents } from '../types'
import ICDNBucket from '../ports/ICDNBucket'

export async function createCDNBucket({ config }: Pick<AppComponents, 'config'>): Promise<ICDNBucket> {
  const bucketName = await config.getString('BUCKET')
  const bucket = bucketName ? new AWS.S3({}) : new MockAws.S3({})

  async function upload(fileName: string, file: stream.Readable): Promise<string> {
    return bucket
      .upload({
        Bucket: bucketName as string,
        Key: fileName,
        Body: file,
        CacheControl: 'max-age=3600,s-maxage=3600',
        ACL: 'public-read'
      })
      .promise()
      .then((result) => {
        return result.Location
      })
  }

  return { upload }
}
