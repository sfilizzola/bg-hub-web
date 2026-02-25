const base = import.meta.env?.VITE_API_BASE_URL;
export const API_BASE_URL =
  typeof base === "string" && base.length > 0 ? base.replace(/\/$/, "") : "http://localhost:3000";
