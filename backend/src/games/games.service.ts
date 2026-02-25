import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Game } from './game.entity';
import { GameProviderRegistry } from './game-provider.registry';
import { GameUpsertService } from './game-upsert.service';
import type { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly providerRegistry: GameProviderRegistry,
    private readonly gameUpsertService: GameUpsertService,
  ) {}

  async createGame(dto: CreateGameDto): Promise<Game> {
    const game = this.gamesRepository.create({
      name: dto.name.trim(),
      apiRef: 'user',
      externalId: randomUUID(),
      year: dto.year ?? null,
      minPlayers: dto.minPlayers ?? null,
      maxPlayers: dto.maxPlayers ?? null,
      playTime: dto.playTime ?? null,
      complexityWeight: dto.complexityWeight ?? null,
      categories: dto.categories ?? null,
      mechanics: dto.mechanics ?? null,
      description: dto.description?.trim() ?? null,
      imageUrl: dto.imageUrl ?? null,
    });
    return this.gamesRepository.save(game);
  }

  async findOne(id: string): Promise<Game> {
    const game = await this.gamesRepository.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException({ message: 'Game not found' });
    }
    return game;
  }

  async search(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      return { games: [], externalAvailable: false };
    }

    const local = await this.gamesRepository.find({
      where: { name: ILike(`%${trimmed}%`) },
      take: 20,
      order: { name: 'ASC' },
    });

    if (local.length > 0) {
      const externalAvailable = await this.providerRegistry.isAnyExternalAvailable();
      return { games: local, externalAvailable };
    }

    const externalAvailable = await this.providerRegistry.isAnyExternalAvailable();
    if (!externalAvailable) {
      return { games: [], externalAvailable: false };
    }

    try {
      const result = await this.providerRegistry.searchAll(trimmed);
      if (result.games.length > 0) {
        const saved = await this.gameUpsertService.upsertMany(result.games);
        return { games: saved, externalAvailable: true };
      }
      return { games: [], externalAvailable: result.available };
    } catch {
      return { games: [], externalAvailable: false };
    }
  }
}

