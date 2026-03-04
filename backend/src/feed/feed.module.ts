import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedEvent } from './feed-event.entity';
import { FeedService } from './feed.service';
import { UserFollow } from '../users/user-follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedEvent, UserFollow])],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
