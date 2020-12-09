import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1607185076533 implements MigrationInterface {
  name = 'InitialMigration1607185076533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "UQ_fa2b8ddbc15d82fc022e1dbdc8a"`
    );
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "uploadedFileId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" ADD "uploadedFileId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "UQ_fa2b8ddbc15d82fc022e1dbdc8a" UNIQUE ("uploadedFileId")`
    );
  }
}
