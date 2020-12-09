import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1607144592175 implements MigrationInterface {
  name = 'InitialMigration1607144592175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL, "uploadedFileId" character varying NOT NULL, "filename" character varying(200) NOT NULL, "mimetype" character varying NOT NULL, "encoding" character varying NOT NULL, "uploadedByUserId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uploadedById" integer, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_6d2ab44c0a95eef23d952db9a79" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_6d2ab44c0a95eef23d952db9a79"`
    );
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
