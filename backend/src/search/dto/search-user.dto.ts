import { ApiProperty } from '@nestjs/swagger';

/** User result in global search (includes follow flags when authenticated). */
export class SearchUserDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
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
