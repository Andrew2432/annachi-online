import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1607180892887 implements MigrationInterface {
  name = 'InitialMigration1607180892887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" ADD "uploadedFileUrl" character varying NOT NULL`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "file"."uploadedFileId" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "UQ_fa2b8ddbc15d82fc022e1dbdc8a" UNIQUE ("uploadedFileId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "UQ_fa2b8ddbc15d82fc022e1dbdc8a"`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "file"."uploadedFileId" IS NULL`
    );
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "uploadedFileUrl"`);
  }
}
