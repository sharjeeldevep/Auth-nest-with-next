import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { MEDIA_TYPE } from './media.constants';

@Injectable()
export class MediaService {
  private _uploadMethod: 'multer' | 's3' = 's3';

  constructor(private configService: ConfigService) {}

  get uploadMethod(): 'multer' | 's3' {
    return this._uploadMethod;
  }

  set uploadMethod(method: 'multer' | 's3') {
    this._uploadMethod = method;
  }

  async uploadFile(
    file: Express.Multer.File,
    assetType: MEDIA_TYPE,
  ): Promise<{ message: string; data?: unknown }> {
    if (this.uploadMethod === 's3') {
      return this.uploadToSignedUrl(file.originalname, assetType);
    } else {
      //todo: need to add multer logic here as needed ;)
      return { message: 'File uploaded to server' };
    }
  }

  async uploadToSignedUrl(
    filename: string,
    assetType: MEDIA_TYPE,
  ): Promise<{ message: string; signedUrl: string }> {
    const credentials = {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
    };

    AWS.config.update({
      credentials: credentials,
      region: 'us-east-1',
      signatureVersion: 'v4',
    });

    const s3 = new AWS.S3();

    const folderName = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

    const params = {
      Bucket: `bucket-payroll`,
      Key: `${folderName}/assets/images/${assetType}/${name}.jpg`,
      Expires: 600, //time to expire in seconds
      ContentType: 'image/*',
    };

    const presignedPutUrl = s3.getSignedUrl('putObject', params);

    return {
      signedUrl: presignedPutUrl,
      message: 'Created Successfully',
    };
  }
}
