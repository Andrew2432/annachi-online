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
export class FileResponse {
  @Field(() => [FileErrorResponse], { nullable: true })
  errors?: FileErrorResponse[];

  @Field(() => File, { nullable: true })
  file?: File;

  @Field(() => [File], { nullable: true })
  files?: File[];
}
