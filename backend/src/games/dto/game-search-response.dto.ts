import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from './game.dto';

export class GameSearchResponseDto {
  @ApiProperty({ type: [GameDto], description: 'Matching games' })
  games!: GameDto[];

  @ApiProperty({
    description: 'Whether external provider (e.g. BGG) was available for this search',
    example: true,
  })
  externalAvailable!: boolean;
}
