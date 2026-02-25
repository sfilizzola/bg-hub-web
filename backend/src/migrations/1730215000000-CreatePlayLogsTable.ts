import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayLogsTable1730215000000 implements MigrationInterface {
  name = 'CreatePlayLogsTable1730215000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "play_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "gameId" uuid NOT NULL,
        "playedAt" timestamptz NOT NULL,
        "durationMinutes" int,
        "playersCount" int,
        "notes" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_play_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_play_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_play_logs_game" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_play_logs_userId_playedAt" ON "play_logs" ("userId", "playedAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_play_logs_userId_playedAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "play_logs"`);
  }
}
