import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../games/game.entity';
import { GameDto } from '../games/dto/game.dto';
import { UserOwnedGame } from '../users/user-owned-game.entity';
import { UserWishlistGame } from '../users/user-wishlist-game.entity';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(UserOwnedGame)
    private readonly ownedRepository: Repository<UserOwnedGame>,
    @InjectRepository(UserWishlistGame)
    private readonly wishlistRepository: Repository<UserWishlistGame>,
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
}

