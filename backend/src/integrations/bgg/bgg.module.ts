import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BggClient } from './bgg.client';
import { BggMapper } from './bgg.mapper';
import { BggService } from './bgg.service';

@Module({
  imports: [ConfigModule],
  providers: [BggClient, BggMapper, BggService],
  exports: [BggService],
})
export class BggModule {}
