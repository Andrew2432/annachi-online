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
import * as yup from 'yup';

import { MyContext } from '../typings/MyContext';
import IsLoggedIn from '../middleware/IsLoggedIn';
import { FileErrorResponse, FileResponse } from '../typings/File';
import deleteFileSchema from '../utils/yupSchema/deleteFile';
import File from '../entity/File';

dotenv.config({
  path: `${__dirname}/../../.env.${process.env.NODE_ENV}`,
});

@Resolver()
export default class FileResolver {
  errorsArr: FileErrorResponse[] = [];

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
          fileOperations: {
            uploadFileResult: {
              message: 'File not uploaded',
              isFileUploaded: false,
              success: false,
            },
          },
        };
      }

      const { createReadStream, filename, mimetype, encoding } = file;

      let fileSize = 0;
      const chunks = [];
      let readStream: Readable = createReadStream();

      //  Check file size is less than configured
      //  Also compress images
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
            fileOperations: {
              uploadFileResult: {
                success: false,
                isFileUploaded: false,
                message: 'File could not be uploaded',
              },
            },
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
            fileOperations: {
              uploadFileResult: {
                success: false,
                isFileUploaded: false,
                message: 'File could not be uploaded',
              },
            },
          };
        }
      }

      let s3Upload;

      // Upload to S3
      try {
        s3Upload = await s3
          .getS3()
          .upload({
            Bucket: s3.config.destinationBucketName,
            Key: `${req.session.userId}/${filename}`,
            Body: readStream,
          })
          .promise();
      } catch (error) {
        logger.error(
          `\n>>>>>\n FileResolver -> uploadFile -> Couldn't upload file to cloud -> ${JSON.stringify(
            error
          )} \n<<<<<\n`
        );

        return {
          errors: [
            {
              field: 'file',
              message: `Couldn't upload file to cloud`,
            },
          ],
          fileOperations: {
            uploadFileResult: {
              success: false,
              isFileUploaded: false,
              message: 'File could not be uploaded',
            },
          },
        };
      }

      logger.info(
        `\n>>>>>\n FileResolver -> uploadFile -> File ${filename} uploaded successfully \n<<<<<\n`
      );

      // Save file metadata to database
      const newFile = await File.create({
        filename,
        mimetype,
        encoding,
        uploadedFileUrl: s3Upload?.Location,
        uploadedFileId: s3Upload?.ETag,
        uploadedByUserId: req.session.userId,
      }).save();

      return {
        file: newFile,
        fileOperations: {
          uploadFileResult: {
            success: true,
            isFileUploaded: true,
            message: 'File uploaded successfully',
          },
        },
      };
    } catch (error) {
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
        fileOperations: {
          uploadFileResult: {
            success: false,
            isFileUploaded: false,
            message: 'Internal server error',
          },
        },
      };
    }
  }

  @Mutation(() => FileResponse)
  @UseMiddleware(IsLoggedIn)
  async deleteFile(
    @Arg('id') id: string,
    @Ctx() { logger, req, s3 }: MyContext
  ): Promise<FileResponse> {
    try {
      // Validation
      try {
        await deleteFileSchema.validate({ id }, { abortEarly: false });
      } catch (validationErr) {
        return this.mapErrors(validationErr);
      }

      // Check file is present in db
      const dbFile = await File.findOne(id);

      if (!dbFile) {
        return {
          errors: [
            {
              field: 'id',
              message: 'File does not exist',
            },
          ],
        };
      }

      const params = {
        Bucket: s3.config.destinationBucketName,
        Key: `${req.session.userId}/${dbFile.filename}`,
      };

      //  Check if file exists in cloud
      try {
        await s3.getS3().getObject(params).promise();
      } catch (error) {
        logger.error(
          `\n>>>>>\n FileResolver -> deleteFile -> File does not exist in cloud -> ${JSON.stringify(
            error
          )} \n<<<<<\n`
        );
        return {
          errors: [
            {
              field: 'id',
              message: 'File missing or invalid',
            },
          ],
        };
      }

      try {
        await s3.getS3().deleteObject(params).promise();
      } catch (error) {
        logger.error(
          `\n>>>>>\n FileResolver -> deleteFile -> Couldn't delete file in cloud -> ${JSON.stringify(
            error
          )} \n<<<<<\n`
        );
        return {
          fileOperations: {
            deleteFileResult: {
              success: false,
              isFileDeleted: false,
              message: 'File could not be deleted',
            },
          },
        };
      }

      //  If cloud file is deleted, then delete db file
      await File.delete(dbFile);

      logger.info(
        `\n>>>>>\n FileResolver -> deleteFile -> File ${dbFile.filename} deleted successfully \n<<<<<\n`
      );

      return {
        fileOperations: {
          deleteFileResult: {
            isFileDeleted: true,
            success: true,
            message: 'File deleted successfully',
          },
        },
      };
    } catch (error) {
      logger.error(
        `\n>>>>>\n FileResolver -> deleteFile -> Internal server error -> ${JSON.stringify(
          error
        )} \n<<<<<`
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

  /**
   * Utility method to map errors to object
   * @param validationErr The error object
   */
  mapErrors(validationErr: any): FileResponse {
    this.errorsArr = [];
    validationErr.inner.forEach((error: yup.ValidationError) => {
      this.errorsArr.push({
        field: error.path,
        message: error.errors[0],
      });
    });

    return {
      errors: this.errorsArr,
    };
  }
}
