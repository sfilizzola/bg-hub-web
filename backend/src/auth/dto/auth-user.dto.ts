import { ApiProperty } from '@nestjs/swagger';

/** Authenticated user or signup response. */
export class AuthUserDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'Unique username', example: 'johndoe' })
  username!: string;
}
