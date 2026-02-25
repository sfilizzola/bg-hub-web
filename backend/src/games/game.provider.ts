export interface GameProviderResult {
  externalId: string;
  apiRef: string;
  name: string;
  imageUrl?: string | null;
  year?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playTime?: number | null;
  complexityWeight?: number | null;
  categories?: string[] | null;
  mechanics?: string[] | null;
  description?: string | null;
}

export interface GameProvider {
  searchByName(query: string): Promise<GameProviderResult[]>;
}

export const GAME_PROVIDER = Symbol('GAME_PROVIDER');

