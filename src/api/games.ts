import { apiFetch } from "./client";

export type GameDto = {
  id: string;
  name: string;
  externalId: string;
  apiRef: string;
  imageUrl: string | null;
  year: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playTime: number | null;
  complexityWeight: number | null;
  categories: string[] | null;
  mechanics: string[] | null;
  description: string | null;
};

export type SearchGamesResponse = {
  games: GameDto[];
  externalAvailable: boolean;
};

export async function searchGames(q: string): Promise<SearchGamesResponse> {
  const params = new URLSearchParams({ q: q.trim() });
  return apiFetch<SearchGamesResponse>(`/games/search?${params}`);
}

export async function getGame(id: string): Promise<GameDto> {
  return apiFetch<GameDto>(`/games/${id}`);
}
