import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

let _client: S3Client | null = null

export function getR2(): S3Client {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })
  }
  return _client
}

export function r2Bucket(): string {
  return useRuntimeConfig().r2BucketName as string
}

export { PutObjectCommand, DeleteObjectCommand, GetObjectCommand }
