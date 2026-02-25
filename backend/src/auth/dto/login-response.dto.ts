import { ApiProperty } from '@nestjs/swagger';

/** Login success response with JWT. */
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for Authorization header',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;
}
