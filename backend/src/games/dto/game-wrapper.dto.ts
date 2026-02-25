import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from './game.dto';

export class GameWrapperDto {
  @ApiProperty({ type: GameDto })
  game!: GameDto;
}
