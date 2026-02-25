import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GameDto } from '../games/dto/game.dto';
import { GamesService } from '../games/games.service';
import { User } from '../users/user.entity';
import { UserFollow } from '../users/user-follow.entity';
import { SearchUserDto } from './dto/search-user.dto';

const GAMES_LIMIT = 10;
const USERS_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(
    private readonly gamesService: GamesService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
  ) {}

  async search(query: string, currentUserId?: string): Promise<{ games: GameDto[]; users: SearchUserDto[] }> {
    const trimmed = query.trim();

    const [games, users] = await Promise.all([
      this.searchGames(trimmed),
      this.searchUsers(trimmed, currentUserId),
    ]);

    return { games, users };
  }

  private async searchGames(trimmed: string): Promise<GameDto[]> {
    if (!trimmed) {
      return [];
    }
    const result = await this.gamesService.search(trimmed);
    const games = result.games.slice(0, GAMES_LIMIT).map((g) => new GameDto(g));
    return games;
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
