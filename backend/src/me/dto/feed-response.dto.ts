import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedEventType } from '../../feed/feed-event-type.enum';

/** Actor or target user in a feed item. */
export class FeedItemActorDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username!: string;

  @ApiProperty({ description: 'Display name', nullable: true })
  displayName!: string | null;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  imageUrl!: string | null;
}

/** Minimal game info in a feed item. */
export class FeedItemGameDto {
  @ApiProperty({ description: 'Game UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Game name', example: 'Catan' })
  name!: string;

  @ApiProperty({ description: 'Cover image URL', nullable: true })
  imageUrl!: string | null;
}

/** Single feed item (text-only for MVP). */
export class FeedItemDto {
  @ApiProperty({ description: 'Feed event UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Event type', enum: FeedEventType })
  type!: FeedEventType;

  @ApiProperty({ description: 'When the event occurred (ISO 8601)', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ description: 'User who performed the action', type: FeedItemActorDto })
  actor!: FeedItemActorDto;

  @ApiPropertyOptional({ description: 'Target user (e.g. for follow events)', type: FeedItemActorDto })
  targetUser?: FeedItemActorDto;

  @ApiPropertyOptional({ description: 'Game (for list/playlog events)', type: FeedItemGameDto })
  game?: FeedItemGameDto;

  @ApiPropertyOptional({ description: 'Play log ID (for PLAYLOG_CREATED)', format: 'uuid' })
  playLogId?: string;

  @ApiProperty({
    description: 'Pre-formatted text for display (e.g. "Alice added Catan to wishlist")',
    example: 'alice added Catan to wishlist',
  })
  text!: string;
}

/** Response for GET /me/feed. */
export class FeedResponseDto {
  @ApiProperty({ description: 'Feed items, newest first', type: [FeedItemDto] })
  items!: FeedItemDto[];

  @ApiPropertyOptional({
    description: 'Cursor for next page; omit when no more pages. Use as ?cursor= for next results.',
    type: String,
    required: false,
    example: '2025-03-04T12:00:00.000Z:123e4567-e89b-12d3-a456-426614174000',
  })
  nextCursor!: string | null;
}
