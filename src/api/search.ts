import { apiFetch } from "./client";

export type SearchUserDto = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followsYou: boolean;
  isFollowing: boolean;
};

/** Source of the search result: local DB or BGG (not yet imported). */
export type GameSearchSource = "LOCAL" | "BGG";

/** Single game search result. LOCAL has id (UUID); BGG has bggId, no id until imported. */
export type GameSearchItemDto = {
  source: GameSearchSource;
  id?: string;
  bggId?: number;
  name: string;
  year?: number | null;
  imageUrl?: string | null;
};

export type SearchResponse = {
  games: GameSearchItemDto[];
  users: SearchUserDto[];
  hasMoreGames?: boolean;
};

export type SearchOptions = {
  gamesLimit?: number;
  gamesOffset?: number;
};

export async function search(q: string, options?: SearchOptions): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: q.trim() });
  if (options?.gamesLimit != null) params.set("gamesLimit", String(options.gamesLimit));
  if (options?.gamesOffset != null) params.set("gamesOffset", String(options.gamesOffset));
  return apiFetch<SearchResponse>(`/search?${params}`);
}
