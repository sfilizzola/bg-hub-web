import { ApiProperty } from '@nestjs/swagger';
import { PlayLogResponseDto } from './play-log-response.dto';

/** List of play logs (latest first). */
export class PlayLogListResponseDto {
  @ApiProperty({ description: 'List of play logs', type: [PlayLogResponseDto] })
  plays!: PlayLogResponseDto[];
}
