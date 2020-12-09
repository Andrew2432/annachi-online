import * as dotenv from 'dotenv';
import { Readable } from 'stream';
import { get } from 'config';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import { MyContext } from '../typings/MyContext';

import IsLoggedIn from '../middleware/IsLoggedIn';
import { FileResponse } from '../typings/File';
import File from '../entity/File';

dotenv.config({
  path: `${__dirname}/../../.env.${process.env.NODE_ENV}`,
});

@Resolver()
export default class FileResolver {
  @Query(() => FileResponse)
  @UseMiddleware(IsLoggedIn)
  async getFiles(@Ctx() { req, logger }: MyContext): Promise<FileResponse> {
    try {
      const { userId } = req.session;
      const files = await File.find({ where: { uploadedByUserId: userId } });

      return {
        files,
      };
    } catch (error) {
      logger.error(
        `\n>>>>>\n FileResolver -> getFile -> Internal server error: ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );

      return {
        errors: [
          {
            field: 'server',
            message: 'Internal server error',
          },
        ],
      };
    }
  }

  @Mutation(() => FileResponse)
  @UseMiddleware(IsLoggedIn)
  async uploadFile(
    @Arg('file', () => GraphQLUpload) file: FileUpload,
    @Ctx() { req, logger, s3 }: MyContext
  ): Promise<FileResponse> {
    try {
      //  Validation
      if (!file) {
        return {
          errors: [
            {
              field: 'file',
              message: 'File not uploaded',
            },
          ],
        };
      }

      const { createReadStream, filename, mimetype, encoding } = file;

      let fileSize = 0;
      const chunks = [];
      let readStream: Readable = createReadStream();

      //  Check file size is less than configured
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of createReadStream()) {
        chunks.push(chunk);
        fileSize += (chunk as Buffer).byteLength;

        if (fileSize > get<number>('files.fileSizeLimit')) {
          createReadStream().destroy();
          return {
            errors: [
              {
                field: 'file',
                message: 'Only file less than 2MB is allowed',
              },
            ],
          };
        }
      }

      if (mimetype.split('/').includes('image')) {
        const buffer = Buffer.concat(chunks);

        const image = await imagemin.buffer(buffer, {
          plugins: [
            imageminJpegtran(),
            imageminPngquant({ quality: [0.6, 0.8] }),
          ],
        });

        readStream = Readable.from(image);

        if (!readStream) {
          return {
            errors: [
              {
                field: 'file',
                message: 'Error during conversion',
              },
            ],
          };
        }
      }

      // Upload to S3
      const s3Upload = await s3
        .getS3()
        .upload({
          Bucket: s3.config.destinationBucketName,
          Key: `${req.session.userId}/${filename}`,
          Body: readStream,
        })
        .promise();

      logger.info(
        `\n>>>>>\n FileResolver -> uploadFile -> File ${filename} uploaded successfully \n<<<<<\n`
      );

      // Save file metadata to database
      const newFile = await File.create({
        filename,
        mimetype,
        encoding,
        uploadedFileUrl: s3Upload.Location,
        uploadedByUserId: req.session.userId,
      }).save();

      return {
        file: newFile,
      };
    } catch (error) {
      console.error(error);
      logger.error(
        `\n>>>>>\n FileResolver -> uploadFile -> Internal server error: ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );

      return {
        errors: [
          {
            field: 'file',
            message: 'Internal server error',
          },
        ],
      };
    }
  }
}
