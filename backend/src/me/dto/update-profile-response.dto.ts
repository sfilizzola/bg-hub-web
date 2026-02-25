import { ApiPropertyOptional } from '@nestjs/swagger';

/** Response after updating profile (echoes updated fields). */
export class UpdateProfileResponseDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'John' })
  displayName?: string;

  @ApiPropertyOptional({ description: 'Short bio', example: 'Board game enthusiast.' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL', example: '/uploads/abc-123.jpg' })
  avatarUrl?: string;
}
