import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';
import { SearchUserDto } from './search-user.dto';

export class GlobalSearchResponseDto {
  @ApiProperty({ type: [GameDto], description: 'Matching games' })
  games!: GameDto[];

  @ApiProperty({ type: [SearchUserDto], description: 'Matching users' })
  users!: SearchUserDto[];
}
