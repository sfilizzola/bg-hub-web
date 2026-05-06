import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Game } from './game.entity';
import { GameProviderRegistry } from './game-provider.registry';
import { GameUpsertService } from './game-upsert.service';
import { BggService } from '../integrations/bgg/bgg.service';
import type { CreateGameDto } from './dto/create-game.dto';
import type { GameSearchItemDto } from './dto/game-search-item.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly providerRegistry: GameProviderRegistry,
    private readonly gameUpsertService: GameUpsertService,
    private readonly bggService: BggService,
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

  /**
   * Search: merge local DB + BGG results. Does NOT import BGG results into DB.
   * Returns minimal fields + source (LOCAL | BGG). Uses proper pagination:
   * - Local: skip(offset) + take(limit) so we only fetch the page we need.
   * - BGG: only fetches the slice of results for this page (saves bandwidth and BGG rate limits).
   */
  async search(
    q: string,
    limit = 20,
    offset = 0,
  ): Promise<{ games: GameSearchItemDto[]; externalAvailable: boolean; hasMoreGames: boolean }> {
    const trimmed = q.trim();
    if (!trimmed) {
      return { games: [], externalAvailable: false, hasMoreGames: false };
    }

    const bggAvailable = this.bggService.isAvailable();
    const where = { name: ILike(`%${trimmed}%`) };

    const localCount = await this.gamesRepository.count({ where });
    const localTake = Math.min(limit, Math.max(0, localCount - offset));
    const bggOffset = Math.max(0, offset - localCount);
    const bggLimit = Math.max(0, limit - localTake);

    const [localRows, bggResult] = await Promise.all([
      localTake > 0
        ? this.gamesRepository.find({ where, skip: offset, take: localTake, order: { name: 'ASC' } })
        : Promise.resolve([]),
      bggAvailable
        ? this.bggService.searchGames(trimmed, { offset: bggOffset, limit: bggLimit })
        : Promise.resolve({ items: [], total: 0 }),
    ]);

    const localDtos: GameSearchItemDto[] = localRows.map((g) => ({
      id: g.id,
      bggId: g.apiRef === 'bgg' ? Number(g.externalId) || undefined : undefined,
      name: g.name,
      year: g.year ?? undefined,
      imageUrl: g.imageUrl ?? undefined,
      source: 'LOCAL' as const,
    }));

    const bggDtos: GameSearchItemDto[] = bggResult.items.map((item) => ({
      bggId: item.bggId,
      name: item.name,
      year: item.year ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      source: 'BGG' as const,
    }));

    const games = [...localDtos, ...bggDtos];
    const totalCombined = localCount + bggResult.total;
    const hasMoreGames = offset + games.length < totalCombined;
    return { games, externalAvailable: bggAvailable, hasMoreGames };
  }

  /**
   * Get game by BGG ID. If in local DB (by externalId), return it. Otherwise fetch from BGG, save, return.
   */
  async getByBggId(bggId: number): Promise<Game> {
    const externalId = String(bggId);
    let game = await this.gamesRepository.findOne({
      where: { apiRef: 'bgg', externalId },
    });
    if (game) return game;

    const external = await this.bggService.fetchGameDetails(bggId);
    if (!external) {
      throw new NotFoundException({ message: 'Game not found on BGG' });
    }
    const [saved] = await this.gameUpsertService.upsertMany([external]);
    return saved;
  }
}

