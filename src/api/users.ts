import { apiFetch } from "./client";

export type PublicProfile = {
  id: string;
  username: string;
  followersCount: number;
  followingCount: number;
};

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${encodeURIComponent(username)}`);
}
