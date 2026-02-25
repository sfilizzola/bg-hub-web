import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamesTable1730205000000 implements MigrationInterface {
  name = 'CreateGamesTable1730205000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "games" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "externalId" varchar NOT NULL,
        "apiRef" varchar NOT NULL,
        "imageUrl" varchar,
        "year" int,
        "minPlayers" int,
        "maxPlayers" int,
        "playTime" int,
        "complexityWeight" float,
        "categories" jsonb,
        "mechanics" jsonb,
        "description" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_games_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_games_apiRef_externalId" UNIQUE ("apiRef", "externalId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "games"`);
  }
}

