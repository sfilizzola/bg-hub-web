import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Game } from './games/game.entity';
import { GamesModule } from './games/games.module';
import { UserOwnedGame } from './users/user-owned-game.entity';
import { UserWishlistGame } from './users/user-wishlist-game.entity';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [User, Game, UserOwnedGame, UserWishlistGame],
        autoLoadEntities: false,
        synchronize: false,
        retryAttempts: 1,
        retryDelay: 500,
      }),
    }),
    TypeOrmModule.forFeature([User, Game, UserOwnedGame, UserWishlistGame]),
    AuthModule,
    GamesModule,
    MeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
