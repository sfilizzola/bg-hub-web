import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBio1730235000000 implements MigrationInterface {
  name = 'AddUserBio1730235000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "bio" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "bio"
    `);
  }
}
