import { ApiProperty } from '@nestjs/swagger';

/** Public profile for /users/:username. */
export class PublicProfileDto {
  @ApiProperty({ description: 'User UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username!: string;

  @ApiProperty({ description: 'Number of followers', example: 42 })
  followersCount!: number;

  @ApiProperty({ description: 'Number of users this user follows', example: 10 })
  followingCount!: number;
}
