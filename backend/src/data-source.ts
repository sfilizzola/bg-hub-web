import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/user.entity';
import { Game } from './games/game.entity';
import { UserOwnedGame } from './users/user-owned-game.entity';
import { UserWishlistGame } from './users/user-wishlist-game.entity';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Game, UserOwnedGame, UserWishlistGame],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});

