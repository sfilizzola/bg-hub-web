import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User email', format: 'email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password', example: 'secret123', minLength: 8 })
  @MinLength(8)
  password!: string;
}

