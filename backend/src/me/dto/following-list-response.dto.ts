import { ApiProperty } from '@nestjs/swagger';
import { UserBasicDto } from './user-basic.dto';

export class FollowingListResponseDto {
  @ApiProperty({ type: [UserBasicDto] })
  users!: UserBasicDto[];
}
