import * as stream from 'stream'
import ICDNBucket from '../../src/ports/ICDNBucket'
import * as MockAws from 'mock-aws-s3'

export function createCDNBucketMock(): ICDNBucket {
  const bucketName = 'test'
  const bucket = new MockAws.S3({})

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
