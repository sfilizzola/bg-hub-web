import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../games/game.entity';
import { UserOwnedGame } from '../users/user-owned-game.entity';
import { UserWishlistGame } from '../users/user-wishlist-game.entity';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, UserOwnedGame, UserWishlistGame])],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}

