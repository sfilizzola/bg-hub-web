import { Game } from '../game.entity';

export class GameDto {
  id!: string;
  name!: string;
  externalId!: string;
  apiRef!: string;
  imageUrl: string | null;
  year: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playTime: number | null;
  complexityWeight: number | null;
  categories: string[] | null;
  mechanics: string[] | null;
  description: string | null;

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

