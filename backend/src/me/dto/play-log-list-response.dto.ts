import { ApiProperty } from '@nestjs/swagger';
import { PlayLogResponseDto } from './play-log-response.dto';

export class PlayLogListResponseDto {
  @ApiProperty({ type: [PlayLogResponseDto] })
  plays!: PlayLogResponseDto[];
}
