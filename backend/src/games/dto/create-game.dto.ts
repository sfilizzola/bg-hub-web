import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ description: 'Game name', example: 'Catan' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Year published', example: 1995, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  year?: number;

  @ApiPropertyOptional({ description: 'Minimum number of players', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minPlayers?: number;

  @ApiPropertyOptional({ description: 'Maximum number of players', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPlayers?: number;

  @ApiPropertyOptional({ description: 'Playing time in minutes', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  playTime?: number;

  @ApiPropertyOptional({ description: 'Weight/complexity (e.g. BGG weight)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  complexityWeight?: number;

  @ApiPropertyOptional({ description: 'Category names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Mechanic names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mechanics?: string[];

  @ApiPropertyOptional({ description: 'Game description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
