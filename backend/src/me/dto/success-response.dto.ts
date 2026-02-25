import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ description: 'Operation succeeded', example: true })
  success!: true;
}
