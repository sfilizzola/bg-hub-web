import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({ description: 'User UUID' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username!: string;

  @ApiProperty({ description: 'Display name', nullable: true })
  displayName!: string | null;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'True if this user follows the current user' })
  followsYou!: boolean;

  @ApiProperty({ description: 'True if the current user follows this user' })
  isFollowing!: boolean;
}
