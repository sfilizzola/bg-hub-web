import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeedEventsTable1730240000000 implements MigrationInterface {
  name = 'CreateFeedEventsTable1730240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "feed_event_type_enum" AS ENUM (
        'FOLLOWED_YOU',
        'YOU_FOLLOWED',
        'ADDED_TO_WISHLIST',
        'ADDED_TO_COLLECTION',
        'PLAYLOG_CREATED'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feed_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "type" "feed_event_type_enum" NOT NULL,
        "actor_user_id" uuid NOT NULL,
        "target_user_id" uuid,
        "game_id" uuid,
        "play_log_id" uuid,
        "metadata" jsonb,
        "visibility_user_id" uuid NOT NULL,
        CONSTRAINT "PK_feed_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_feed_events_actor_user" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_feed_events_target_user" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_feed_events_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_feed_events_visibility_user" FOREIGN KEY ("visibility_user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_feed_events_visibility_user_id_created_at"
      ON "feed_events" ("visibility_user_id", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_feed_events_actor_user_id" ON "feed_events" ("actor_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_feed_events_created_at" ON "feed_events" ("created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feed_events_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feed_events_actor_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feed_events_visibility_user_id_created_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feed_events"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "feed_event_type_enum"`);
  }
}
