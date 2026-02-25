import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from './game.dto';

/** Single game wrapper (e.g. add owned/wishlist response). */
export class GameWrapperDto {
  @ApiProperty({ description: 'Game', type: GameDto })
  game!: GameDto;
}
