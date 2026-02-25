import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';

/** Single play log with embedded game. */
export class PlayLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  gameId!: string;

  @ApiProperty({ description: 'When the game was played (ISO 8601)' })
  playedAt!: string;

  @ApiProperty({ nullable: true })
  durationMinutes!: number | null;

  @ApiProperty({ nullable: true })
  playersCount!: number | null;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: () => GameDto })
  game!: GameDto;
}
