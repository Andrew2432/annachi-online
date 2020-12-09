import { FileUpload } from 'graphql-upload';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import User from './User';

@Entity()
@ObjectType()
export default class File extends BaseEntity implements Partial<FileUpload> {
  @Field(() => ID)
  @PrimaryColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  uploadedFileUrl: string;

  @Field()
  @Column({ length: 200, nullable: false })
  filename: string;

  @Field()
  @Column({ nullable: false })
  mimetype: string;

  @Field()
  @Column({ nullable: false })
  encoding: string;

  @Field()
  @Column({ nullable: false })
  uploadedByUserId: string;

  @ManyToOne(() => User, (user) => user.images)
  uploadedBy!: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(
    uploadedFileUrl: string,
    filename: string,
    mimetype: string,
    encoding: string,
    uploadedByUserId: string
  ) {
    super();
    this.id = uuidv4();
    this.uploadedFileUrl = uploadedFileUrl;
    this.filename = filename;
    this.mimetype = mimetype;
    this.encoding = encoding;
    this.uploadedByUserId = uploadedByUserId;
  }
}
