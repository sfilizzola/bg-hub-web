import { apiFetch, setToken } from "./client";

export type User = { id: string; email: string; username: string };

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
  const data = await apiFetch<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.accessToken) setToken(data.accessToken);
  return data;
}

export async function signup(
  email: string,
  username: string,
  password: string
): Promise<User> {
  return apiFetch<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}
