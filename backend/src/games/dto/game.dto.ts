import { ApiProperty } from '@nestjs/swagger';
import { Game } from '../game.entity';

export class GameDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Catan' })
  name!: string;

  @ApiProperty()
  externalId!: string;

  @ApiProperty({ example: 'bgg' })
  apiRef!: string;

  @ApiProperty({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ nullable: true, example: 1995 })
  year!: number | null;

  @ApiProperty({ nullable: true, example: 3 })
  minPlayers!: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  maxPlayers!: number | null;

  @ApiProperty({ nullable: true, example: 90 })
  playTime!: number | null;

  @ApiProperty({ nullable: true })
  complexityWeight!: number | null;

  @ApiProperty({ nullable: true, type: [String] })
  categories!: string[] | null;

  @ApiProperty({ nullable: true, type: [String] })
  mechanics!: string[] | null;

  @ApiProperty({ nullable: true })
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

