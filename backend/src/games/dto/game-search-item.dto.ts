import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Source of the search result: local DB or BGG (not yet imported). */
export type GameSearchSource = 'LOCAL' | 'BGG';

/**
 * Single search result item. Unified for local and BGG: minimal fields plus source.
 * LOCAL: id present (our UUID), bggId present if game was imported from BGG.
 * BGG: bggId present, no id until imported.
 */
export class GameSearchItemDto {
  @ApiPropertyOptional({
    description: 'Our game UUID (present for LOCAL)',
    format: 'uuid',
  })
  id?: string;

  @ApiPropertyOptional({
    description: 'BGG ID (present for BGG results, or for LOCAL when imported from BGG)',
    example: 13,
  })
  bggId?: number;

  @ApiProperty({ description: 'Game name', example: 'Catan' })
  name!: string;

  @ApiPropertyOptional({ description: 'Year published', example: 1995 })
  year?: number | null;

  @ApiPropertyOptional({ description: 'Thumbnail / cover URL' })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'Where this result comes from',
    enum: ['LOCAL', 'BGG'],
    example: 'LOCAL',
  })
  source!: GameSearchSource;
}
