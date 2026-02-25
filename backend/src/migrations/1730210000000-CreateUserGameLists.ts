import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserGameLists1730210000000 implements MigrationInterface {
  name = 'CreateUserGameLists1730210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_owned_games" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "gameId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_owned_games_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_owned_game_user_game" UNIQUE ("userId", "gameId"),
        CONSTRAINT "FK_user_owned_games_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_owned_games_game" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_wishlist_games" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "gameId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_wishlist_games_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_wishlist_game_user_game" UNIQUE ("userId", "gameId"),
        CONSTRAINT "FK_user_wishlist_games_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_wishlist_games_game" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_wishlist_games"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_owned_games"`);
  }
}

