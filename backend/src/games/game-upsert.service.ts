import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { ExternalGameMapper } from './external-game.mapper';
import type { ExternalGame } from './providers/types';

@Injectable()
export class GameUpsertService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly mapper: ExternalGameMapper,
  ) {}

  /**
   * Upserts games by (apiRef, externalId). Returns saved entities in order.
   */
  async upsertMany(externals: ExternalGame[]): Promise<Game[]> {
    const saved: Game[] = [];
    for (const ext of externals) {
      let game = await this.gamesRepository.findOne({
        where: { apiRef: ext.apiRef, externalId: ext.externalId },
      });
      const fields = this.mapper.toEntityFields(ext);
      if (game) {
        Object.assign(game, fields);
      } else {
        game = this.gamesRepository.create(fields);
        game.externalId = ext.externalId;
        game.apiRef = ext.apiRef;
      }
      saved.push(await this.gamesRepository.save(game));
    }
    return saved;
  }
}
