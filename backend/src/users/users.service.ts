import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserFollow } from './user-follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
  ) {}

  async getPublicProfile(username: string): Promise<{
    id: string;
    username: string;
    followersCount: number;
    followingCount: number;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    const [followersCount, followingCount] = await Promise.all([
      this.userFollowRepository.count({ where: { followingId: user.id } }),
      this.userFollowRepository.count({ where: { followerId: user.id } }),
    ]);
    return {
      id: user.id,
      username: user.username,
      followersCount,
      followingCount,
      displayName: user.displayName ?? undefined,
      bio: user.bio ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  }
}
