import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePlayLogDto {
  @ApiProperty({ description: 'UUID of the game played', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  gameId!: string;

  @ApiProperty({ description: 'When the game was played (ISO 8601)', example: '2025-02-25T14:00:00.000Z' })
  @IsISO8601()
  playedAt!: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Number of players', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  playersCount?: number;

  @ApiPropertyOptional({ description: 'Free-text notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
