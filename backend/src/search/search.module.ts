import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';
import { User } from '../users/user.entity';
import { UserFollow } from '../users/user-follow.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFollow]),
    AuthModule,
    GamesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
