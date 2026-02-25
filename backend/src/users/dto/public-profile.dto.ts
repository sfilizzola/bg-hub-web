import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Public profile for /users/:username. */
export class PublicProfileDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username!: string;

  @ApiProperty({ description: 'Number of followers', example: 42 })
  followersCount!: number;

  @ApiProperty({ description: 'Number of users this user follows', example: 10 })
  followingCount!: number;

  @ApiPropertyOptional({ description: 'Display name', example: 'John' })
  displayName?: string;

  @ApiPropertyOptional({ description: 'Short bio', example: 'Board game enthusiast.' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL', example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;
}
