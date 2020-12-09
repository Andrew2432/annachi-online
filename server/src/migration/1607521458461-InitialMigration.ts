import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1607521458461 implements MigrationInterface {
    name = 'InitialMigration1607521458461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "uploadedFileId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "uploadedFileId"`);
    }

}
