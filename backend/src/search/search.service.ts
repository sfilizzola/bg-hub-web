import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { GameSearchItemDto } from '../games/dto/game-search-item.dto';
import { GamesService } from '../games/games.service';
import { User } from '../users/user.entity';
import { UserFollow } from '../users/user-follow.entity';
import { SearchUserDto } from './dto/search-user.dto';

const USERS_LIMIT = 10;
const DEFAULT_GAMES_LIMIT = 20;

@Injectable()
export class SearchService {
  constructor(
    private readonly gamesService: GamesService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
  ) {}

  async search(
    query: string,
    currentUserId?: string,
    options?: { gamesLimit?: number; gamesOffset?: number },
  ): Promise<{ games: GameSearchItemDto[]; users: SearchUserDto[]; hasMoreGames?: boolean }> {
    const trimmed = query.trim();
    const gamesLimit = options?.gamesLimit ?? DEFAULT_GAMES_LIMIT;
    const gamesOffset = options?.gamesOffset ?? 0;

    const [gamesResult, users] = await Promise.all([
      this.searchGames(trimmed, gamesLimit, gamesOffset),
      this.searchUsers(trimmed, currentUserId),
    ]);

    return {
      games: gamesResult.games,
      users,
      hasMoreGames: gamesResult.hasMoreGames,
    };
  }

  private async searchGames(
    trimmed: string,
    limit: number,
    offset: number,
  ): Promise<{ games: GameSearchItemDto[]; hasMoreGames: boolean }> {
    if (!trimmed) {
      return { games: [], hasMoreGames: false };
    }
    return this.gamesService.search(trimmed, limit, offset);
  }

  private async searchUsers(trimmed: string, currentUserId?: string): Promise<SearchUserDto[]> {
    if (!trimmed) {
      return [];
    }

    const qb = this.usersRepository
      .createQueryBuilder('u')
      .where('(u.username ILIKE :q OR u.display_name ILIKE :q)', { q: `%${trimmed}%` })
      .orderBy('u.username', 'ASC')
      .take(USERS_LIMIT);

    if (currentUserId) {
      qb.andWhere('u.id != :currentUserId', { currentUserId });
    }

    const users = await qb.getMany();
    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((u) => u.id);
    let isFollowingSet = new Set<string>();
    let followsYouSet = new Set<string>();

    if (currentUserId) {
      const [following, followers] = await Promise.all([
        this.userFollowRepository.find({
          where: { followerId: currentUserId, followingId: In(userIds) },
          select: ['followingId'],
        }),
        this.userFollowRepository.find({
          where: { followerId: In(userIds), followingId: currentUserId },
          select: ['followerId'],
        }),
      ]);
      isFollowingSet = new Set(following.map((r) => r.followingId));
      followsYouSet = new Set(followers.map((r) => r.followerId));
    }

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName ?? null,
      avatarUrl: u.avatarUrl ?? null,
      followsYou: followsYouSet.has(u.id),
      isFollowing: isFollowingSet.has(u.id),
    })) as SearchUserDto[];
  }
}
