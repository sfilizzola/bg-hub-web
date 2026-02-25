import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Update current user profile. Username is immutable and must not be sent. */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'John', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Short bio', example: 'Board game enthusiast.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL (e.g. from photo upload)', example: '/uploads/abc.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
