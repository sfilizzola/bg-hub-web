import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../games/game.entity';
import { User } from '../users/user.entity';
import { UserOwnedGame } from '../users/user-owned-game.entity';
import { UserWishlistGame } from '../users/user-wishlist-game.entity';
import { UserFollow } from '../users/user-follow.entity';
import { PlayLog } from '../plays/play-log.entity';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, UserOwnedGame, UserWishlistGame, UserFollow, PlayLog])],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}

