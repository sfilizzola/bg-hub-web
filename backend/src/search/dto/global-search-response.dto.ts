import { ApiProperty } from '@nestjs/swagger';
import { GameDto } from '../../games/dto/game.dto';
import { SearchUserDto } from './search-user.dto';

/** Global search result (games and users). When authenticated, user results include follow flags. */
export class GlobalSearchResponseDto {
  @ApiProperty({ description: 'Matching games', type: [GameDto] })
  games!: GameDto[];

  @ApiProperty({ description: 'Matching users (excludes current user when authenticated)', type: [SearchUserDto] })
  users!: SearchUserDto[];
}
