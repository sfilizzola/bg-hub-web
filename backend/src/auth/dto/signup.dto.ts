import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: 'User email', format: 'email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Unique username', example: 'johndoe' })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Password (min 8 characters)', example: 'secret123', minLength: 8 })
  @MinLength(8)
  password!: string;
}

