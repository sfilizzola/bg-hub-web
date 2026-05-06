import { ApiProperty } from '@nestjs/swagger';
import { GameSearchItemDto } from '../../games/dto/game-search-item.dto';
import { SearchUserDto } from './search-user.dto';

/** Global search result (games and users). When authenticated, user results include follow flags. */
export class GlobalSearchResponseDto {
  @ApiProperty({ description: 'Matching games (local + BGG merged, source LOCAL | BGG)', type: [GameSearchItemDto] })
  games!: GameSearchItemDto[];

  @ApiProperty({ description: 'Matching users (excludes current user when authenticated)', type: [SearchUserDto] })
  users!: SearchUserDto[];

  @ApiProperty({
    description: 'True if more game results are available (use gamesOffset to fetch next page)',
    required: false,
  })
  hasMoreGames?: boolean;
}
