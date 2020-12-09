/* eslint-disable camelcase */
import { Field, ObjectType } from 'type-graphql';
import File from '../entity/File';

@ObjectType()
export class FileErrorResponse {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class FileOperations {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

@ObjectType()
class FileUploadOperation extends FileOperations {
  @Field()
  isFileUploaded!: boolean;
}

@ObjectType()
class FileDeleteOperation extends FileOperations {
  @Field()
  isFileDeleted!: boolean;
}

@ObjectType()
export class FileOperationsResponse {
  @Field(() => FileUploadOperation, { nullable: true })
  uploadFileResult?: FileUploadOperation;

  @Field(() => FileDeleteOperation, { nullable: true })
  deleteFileResult?: FileDeleteOperation;
}

@ObjectType()
export class FileResponse {
  @Field(() => [FileErrorResponse], { nullable: true })
  errors?: FileErrorResponse[];

  @Field(() => File, { nullable: true })
  file?: File;

  @Field(() => [File], { nullable: true })
  files?: File[];

  @Field(() => FileOperationsResponse, { nullable: true })
  fileOperations?: FileOperationsResponse;
}
