import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePlayLogDto {
  @IsUUID()
  gameId!: string;

  @IsISO8601()
  playedAt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  playersCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
