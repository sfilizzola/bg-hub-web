import { ApiProperty } from '@nestjs/swagger';
import { UserBasicDto } from './user-basic.dto';

/** List of users (following or followers). */
export class FollowingListResponseDto {
  @ApiProperty({ description: 'List of users', type: [UserBasicDto] })
  users!: UserBasicDto[];
}
