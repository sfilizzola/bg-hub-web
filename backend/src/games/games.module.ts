import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { BggGameProvider } from './bgg.provider';
import { GAME_PROVIDER } from './game.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GamesController],
  providers: [
    GamesService,
    BggGameProvider,
    {
      provide: GAME_PROVIDER,
      useExisting: BggGameProvider,
    },
  ],
})
export class GamesModule {}

