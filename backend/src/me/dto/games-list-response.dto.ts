import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';

export class GamesListResponseDto {
  @ApiProperty({ type: [GameDto] })
  games!: GameDto[];
}
