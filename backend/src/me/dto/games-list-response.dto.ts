import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';

/** List of games (owned or wishlist). */
export class GamesListResponseDto {
  @ApiProperty({ description: 'List of games', type: [GameDto] })
  games!: GameDto[];
}
