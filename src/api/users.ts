import { apiFetch } from "./client";
import type { GameDto } from "./games";

export type PublicProfile = {
  id: string;
  username: string;
  followersCount: number;
  followingCount: number;
  /** Optional; when present, used for avatar in profile UI. */
  avatarUrl?: string;
  /** Optional; when present, shown as primary display name. */
  displayName?: string;
  /** Optional; when present, shown in bio section. */
  bio?: string;
};

/** Payload for updating own profile. Username is immutable and must not be sent. */
export type UpdateProfilePayload = {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
};

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${encodeURIComponent(username)}`);
}

/** Get a user's collection (owned games) by username. Use for profile tabs when viewing that user. */
export async function getUserCollection(username: string): Promise<{ games: GameDto[] }> {
  return apiFetch<{ games: GameDto[] }>(`/users/${encodeURIComponent(username)}/owned`);
}

/** Get a user's wanted list (wishlist) by username. Use for profile tabs when viewing that user. */
export async function getUserWanted(username: string): Promise<{ games: GameDto[] }> {
  return apiFetch<{ games: GameDto[] }>(`/users/${encodeURIComponent(username)}/wishlist`);
}

/** Update current user profile (displayName, bio, avatarUrl). Username is never sent. */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UpdateProfilePayload> {
  return apiFetch<UpdateProfilePayload>("/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** Upload profile photo (multipart). Returns URL to use as avatarUrl in updateMyProfile. */
export async function uploadMyPhoto(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string }>("/me/photo", {
    method: "POST",
    body: formData,
  });
}
