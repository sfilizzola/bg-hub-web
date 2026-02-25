import { apiFetch } from "./client";
import type { GameDto } from "./games";

export async function getOwned(): Promise<{ games: GameDto[] }> {
  return apiFetch<{ games: GameDto[] }>("/me/owned");
}

export async function addOwned(gameId: string): Promise<{ game: GameDto }> {
  return apiFetch<{ game: GameDto }>(`/me/owned/${gameId}`, { method: "POST" });
}

export async function removeOwned(gameId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/me/owned/${gameId}`, { method: "DELETE" });
}

export async function getWishlist(): Promise<{ games: GameDto[] }> {
  return apiFetch<{ games: GameDto[] }>("/me/wishlist");
}

export async function addWishlist(gameId: string): Promise<{ game: GameDto }> {
  return apiFetch<{ game: GameDto }>(`/me/wishlist/${gameId}`, { method: "POST" });
}

export async function removeWishlist(gameId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/me/wishlist/${gameId}`, { method: "DELETE" });
}

export type PlayLogDto = {
  id: string;
  userId: string;
  gameId: string;
  playedAt: string;
  durationMinutes: number | null;
  playersCount: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  game: GameDto;
};

export async function getPlays(): Promise<{ plays: PlayLogDto[] }> {
  return apiFetch<{ plays: PlayLogDto[] }>("/me/plays");
}

export async function createPlay(body: {
  gameId: string;
  playedAt: string;
  durationMinutes?: number;
  playersCount?: number;
  notes?: string;
}): Promise<PlayLogDto> {
  return apiFetch<PlayLogDto>("/me/plays", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deletePlay(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/me/plays/${id}`, { method: "DELETE" });
}

export type FollowUser = { id: string; email: string; username: string };

export async function followUser(username: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/me/follow/${encodeURIComponent(username)}`, {
    method: "POST",
  });
}

export async function unfollowUser(username: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/me/follow/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
}

export async function getFollowing(): Promise<{ users: FollowUser[] }> {
  return apiFetch<{ users: FollowUser[] }>("/me/following");
}

export async function getFollowers(): Promise<{ users: FollowUser[] }> {
  return apiFetch<{ users: FollowUser[] }>("/me/followers");
}
