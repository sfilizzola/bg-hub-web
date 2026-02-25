import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ description: 'Service status', example: 'ok' })
  status!: string;
}
