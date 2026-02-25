import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFollowTable1730225000000 implements MigrationInterface {
  name = 'CreateUserFollowTable1730225000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_follows" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "follower_id" uuid NOT NULL,
        "following_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_follows_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_follow_follower_following" UNIQUE ("follower_id", "following_id"),
        CONSTRAINT "FK_user_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_follows_following" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_follows_follower_id" ON "user_follows" ("follower_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_follows_following_id" ON "user_follows" ("following_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_follows_following_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_follows_follower_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_follows"`);
  }
}
