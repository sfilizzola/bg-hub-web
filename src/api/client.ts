import { API_BASE_URL } from "../config/env";

const TOKEN_KEY = "bg_hub_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const pathStr = path.startsWith("/") ? path : `/${path}`;
  const url = base + pathStr;
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };
  // Do not set Content-Type for FormData; browser sets multipart boundary
  if (!(options.body instanceof FormData)) {
    (headers)["Content-Type"] = "application/json";
  }
  if (token) {
    (headers)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    globalThis.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      // Keep default message from response text
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}
