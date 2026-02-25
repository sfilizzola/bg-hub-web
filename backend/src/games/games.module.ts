import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { BggGameProvider } from './bgg.provider';
import { GameProviderRegistry } from './game-provider.registry';
import { ExternalGameMapper } from './external-game.mapper';
import { GameUpsertService } from './game-upsert.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GamesController],
  providers: [
    GamesService,
    ExternalGameMapper,
    GameUpsertService,
    GameProviderRegistry,
    BggGameProvider,
  ],
})
export class GamesModule {}
