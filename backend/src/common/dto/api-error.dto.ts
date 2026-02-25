import { ApiProperty } from '@nestjs/swagger';

/**
 * Reusable error response schema for 4xx/5xx responses.
 */
export class ApiErrorDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Resource not found',
  })
  message!: string;
}
