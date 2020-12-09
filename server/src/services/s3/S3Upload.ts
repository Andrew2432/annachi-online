import * as dotenv from 'dotenv';
import * as path from 'path';
import AWS from 'aws-sdk';
import { ICloudProvider } from 'src/typings/ICloudProvider';

dotenv.config({
  path: path.join(__dirname, `../../../.env.${process.env.NODE_ENV}`),
});

export default class AWSS3Uploader {
  private s3: AWS.S3;

  public config: ICloudProvider;

  constructor(config: ICloudProvider) {
    AWS.config = new AWS.Config();
    AWS.config.update({
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    });

    this.s3 = new AWS.S3();
    this.config = config;
  }

  getS3() {
    return this.s3;
  }
}
