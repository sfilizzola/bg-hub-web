import { ApiProperty } from '@nestjs/swagger';

/** Response after uploading a profile photo. Use the returned URL in PATCH /me/profile avatarUrl. */
export class UploadPhotoResponseDto {
  @ApiProperty({ description: 'URL of the uploaded image (use in profile avatarUrl)', example: '/uploads/abc-123.jpg' })
  url!: string;
}
