import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';

/** Single play log with embedded game. */
export class PlayLogResponseDto {
  @ApiProperty({ description: 'Play log UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Owner user UUID', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Game UUID', format: 'uuid' })
  gameId!: string;

  @ApiProperty({ description: 'When the game was played (ISO 8601)', format: 'date-time' })
  playedAt!: string;

  @ApiProperty({ description: 'Duration in minutes', nullable: true })
  durationMinutes!: number | null;

  @ApiProperty({ description: 'Number of players', nullable: true })
  playersCount!: number | null;

  @ApiProperty({ description: 'Free-text notes', nullable: true })
  notes!: string | null;

  @ApiProperty({ description: 'Record creation time (ISO 8601)', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ description: 'Record last update (ISO 8601)', format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ description: 'Game details', type: () => GameDto })
  game!: GameDto;
}
