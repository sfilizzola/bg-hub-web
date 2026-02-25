import { ApiProperty } from '@nestjs/swagger';

/** Minimal user info (e.g. in following/followers list). */
export class UserBasicDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username!: string;
}
