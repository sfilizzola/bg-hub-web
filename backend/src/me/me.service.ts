import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../games/game.entity';
import { GameDto } from '../games/dto/game.dto';
import { UserOwnedGame } from '../users/user-owned-game.entity';
import { UserWishlistGame } from '../users/user-wishlist-game.entity';
import { PlayLog } from '../plays/play-log.entity';
import { CreatePlayLogDto } from './dto/create-play-log.dto';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(UserOwnedGame)
    private readonly ownedRepository: Repository<UserOwnedGame>,
    @InjectRepository(UserWishlistGame)
    private readonly wishlistRepository: Repository<UserWishlistGame>,
    @InjectRepository(PlayLog)
    private readonly playLogsRepository: Repository<PlayLog>,
  ) {}

  private async getGameOrThrow(gameId: string): Promise<Game> {
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException({ message: 'Game not found' });
    }
    return game;
  }

  async addOwned(userId: string, gameId: string) {
    const game = await this.getGameOrThrow(gameId);

    let link = await this.ownedRepository.findOne({
      where: { userId, gameId },
      relations: ['game'],
    });

    if (!link) {
      link = this.ownedRepository.create({
        userId,
        gameId,
        game,
      });
      link = await this.ownedRepository.save(link);
    }

    return new GameDto(link.game);
  }

  async removeOwned(userId: string, gameId: string) {
    await this.getGameOrThrow(gameId);
    await this.ownedRepository.delete({ userId, gameId });
    return { success: true };
  }

  async listOwned(userId: string) {
    const links = await this.ownedRepository.find({
      where: { userId },
      relations: ['game'],
      order: { createdAt: 'DESC' },
    });
    return links.map((link) => new GameDto(link.game));
  }

  async addWishlist(userId: string, gameId: string) {
    const game = await this.getGameOrThrow(gameId);

    let link = await this.wishlistRepository.findOne({
      where: { userId, gameId },
      relations: ['game'],
    });

    if (!link) {
      link = this.wishlistRepository.create({
        userId,
        gameId,
        game,
      });
      link = await this.wishlistRepository.save(link);
    }

    return new GameDto(link.game);
  }

  async removeWishlist(userId: string, gameId: string) {
    await this.getGameOrThrow(gameId);
    await this.wishlistRepository.delete({ userId, gameId });
    return { success: true };
  }

  async listWishlist(userId: string) {
    const links = await this.wishlistRepository.find({
      where: { userId },
      relations: ['game'],
      order: { createdAt: 'DESC' },
    });
    return links.map((link) => new GameDto(link.game));
  }

  async createPlayLog(userId: string, dto: CreatePlayLogDto) {
    const game = await this.getGameOrThrow(dto.gameId);
    const playLog = this.playLogsRepository.create({
      userId,
      gameId: dto.gameId,
      playedAt: new Date(dto.playedAt),
      durationMinutes: dto.durationMinutes ?? null,
      playersCount: dto.playersCount ?? null,
      notes: dto.notes ?? null,
      game,
    });
    const saved = await this.playLogsRepository.save(playLog);
    return {
      id: saved.id,
      userId: saved.userId,
      gameId: saved.gameId,
      playedAt: saved.playedAt,
      durationMinutes: saved.durationMinutes,
      playersCount: saved.playersCount,
      notes: saved.notes,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      game: new GameDto(game),
    };
  }

  async listPlays(userId: string) {
    const playLogs = await this.playLogsRepository.find({
      where: { userId },
      relations: ['game'],
      order: { playedAt: 'DESC' },
      take: 50,
    });
    return playLogs.map((log) => ({
      id: log.id,
      userId: log.userId,
      gameId: log.gameId,
      playedAt: log.playedAt,
      durationMinutes: log.durationMinutes,
      playersCount: log.playersCount,
      notes: log.notes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      game: new GameDto(log.game),
    }));
  }

  async deletePlayLog(userId: string, id: string) {
    const playLog = await this.playLogsRepository.findOne({
      where: { id, userId },
    });
    if (!playLog) {
      throw new NotFoundException({ message: 'Play log not found' });
    }
    await this.playLogsRepository.delete({ id });
    return { success: true };
  }
}

