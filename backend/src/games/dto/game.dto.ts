import { ApiProperty } from '@nestjs/swagger';
import { Game } from '../game.entity';

/** Game catalog item (owned, wishlist, search, or single game). */
export class GameDto {
  @ApiProperty({ description: 'Game UUID', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Game name', example: 'Catan' })
  name!: string;

  @ApiProperty({ description: 'External provider ID (e.g. BGG)', example: '13' })
  externalId!: string;

  @ApiProperty({ description: 'External API reference', example: 'bgg' })
  apiRef!: string;

  @ApiProperty({ description: 'Cover image URL', nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Year published', nullable: true, example: 1995 })
  year!: number | null;

  @ApiProperty({ description: 'Minimum number of players', nullable: true, example: 3 })
  minPlayers!: number | null;

  @ApiProperty({ description: 'Maximum number of players', nullable: true, example: 4 })
  maxPlayers!: number | null;

  @ApiProperty({ description: 'Playing time in minutes', nullable: true, example: 90 })
  playTime!: number | null;

  @ApiProperty({ description: 'Complexity/weight (e.g. BGG)', nullable: true })
  complexityWeight!: number | null;

  @ApiProperty({ description: 'Category names', nullable: true, type: [String] })
  categories!: string[] | null;

  @ApiProperty({ description: 'Mechanic names', nullable: true, type: [String] })
  mechanics!: string[] | null;

  @ApiProperty({ description: 'Game description', nullable: true })
  description!: string | null;

  constructor(game: Game) {
    this.id = game.id;
    this.name = game.name;
    this.externalId = game.externalId;
    this.apiRef = game.apiRef;
    this.imageUrl = game.imageUrl;
    this.year = game.year;
    this.minPlayers = game.minPlayers;
    this.maxPlayers = game.maxPlayers;
    this.playTime = game.playTime;
    this.complexityWeight = game.complexityWeight;
    this.categories = game.categories;
    this.mechanics = game.mechanics;
    this.description = game.description;
  }
}

