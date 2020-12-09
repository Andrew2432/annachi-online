interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  destinationBucketName: string;
  region: string;
}

export type ICloudProvider = S3Config;
