/* eslint-disable @typescript-eslint/no-explicit-any */
/* Centralized API client for the SDK
   - Uses Vite env vars (VITE_API_BASE_URL)
   - Exports typed helper functions: getOffers, getOffer, claimOffer
   - Use `import { getOffers } from './api/client'` where needed
*/

type Offer = {
  id: string;
  name: string;
  subtitle?: string;
  logo?: string;
  earn?: string;
  duration?: string;
  [k: string]: any;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // If user provided an API key via env, include it (optional)
  const apiKey = (import.meta as any).env?.VITE_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status} ${res.statusText}: ${text}`);
  }

  // attempt to parse JSON, fallback to text
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text() as unknown as T;
}

export async function getOffers(): Promise<Offer[]> {
  return request<Offer[]>("/api/sdk/list");
}

export async function getOffer(id: string): Promise<Offer> {
  return request<Offer>(`/api/sdk/${id}`);
}

export default {
  getOffers,
  getOffer,
};
