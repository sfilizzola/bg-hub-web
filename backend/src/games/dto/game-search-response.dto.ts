import { ApiProperty } from '@nestjs/swagger';
import { GameSearchItemDto } from './game-search-item.dto';

export class GameSearchResponseDto {
  @ApiProperty({
    type: [GameSearchItemDto],
    description: 'Matching games from local DB and/or BGG (merged). source indicates LOCAL or BGG.',
  })
  games!: GameSearchItemDto[];

  @ApiProperty({
    description: 'Whether BGG was available for this search',
    example: true,
  })
  externalAvailable!: boolean;
}
