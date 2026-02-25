import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async search(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      return { games: [], externalAvailable: false };
    }

    const games = await this.gamesRepository.find({
      where: { name: ILike(`%${trimmed}%`) },
      take: 20,
      order: { name: 'ASC' },
    });

    return {
      games,
      externalAvailable: false,
    };
  }
}

