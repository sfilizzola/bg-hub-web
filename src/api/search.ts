import { apiFetch } from "./client";
import type { GameDto } from "./games";

export type SearchUserDto = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followsYou: boolean;
  isFollowing: boolean;
};

export type SearchResponse = {
  games: GameDto[];
  users: SearchUserDto[];
};

export async function search(q: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: q.trim() });
  return apiFetch<SearchResponse>(`/search?${params}`);
}
