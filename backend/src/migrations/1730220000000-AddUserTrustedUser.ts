import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTrustedUser1730220000000 implements MigrationInterface {
  name = 'AddUserTrustedUser1730220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "trusted_user" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "trusted_user"
    `);
  }
}
