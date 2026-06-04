/**
 * Single source of truth for SDK API host resolution.
 * Integrators normally only pass apiKey to init(); base URL is managed here.
 *
 * Priority (first match wins):
 * 1. init({ baseUrl }) — explicit override
 * 2. window.GROWBOLT_API_BASE_URL — runtime override in host page
 * 3. Page served on localhost / 127.0.0.1 → http://localhost
 * 4. Build-time __GROWBOLT_API_BASE_URL__ (from VITE_API_BASE_URL at npm run build)
 * 5. https://admin.growbolt.ai (production default)
 */

declare const __GROWBOLT_API_BASE_URL__: string | undefined;

export const PRODUCTION_API_BASE_URL = "https://admin.growbolt.ai";
export const LOCAL_API_BASE_URL = "http://localhost";

function readBuildDefault(): string | undefined {
  try {
    if (typeof __GROWBOLT_API_BASE_URL__ === "string" && __GROWBOLT_API_BASE_URL__) {
      return __GROWBOLT_API_BASE_URL__;
    }
  } catch {
    /* not defined at build time */
  }
  return undefined;
}

function readRuntimeGlobalOverride(): string | undefined {
  const globalOverride = (globalThis as { GROWBOLT_API_BASE_URL?: string })
    .GROWBOLT_API_BASE_URL;
  if (typeof globalOverride === "string" && globalOverride.trim()) {
    return globalOverride.trim().replace(/\/$/, "");
  }
  return undefined;
}

/** When the host page is opened on localhost, default API to local backend. */
function readLocalDevHostDefault(): string | undefined {
  if (typeof window === "undefined" || !window.location?.hostname) {
    return undefined;
  }
  const host = window.location.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") {
    return LOCAL_API_BASE_URL;
  }
  return undefined;
}

/** Default API origin used when init() does not pass baseUrl. */
export function getDefaultApiBaseUrl(): string {
  return (
    readRuntimeGlobalOverride() ||
    readLocalDevHostDefault() ||
    readBuildDefault() ||
    PRODUCTION_API_BASE_URL
  ).replace(/\/$/, "");
}

/** Resolve API origin: optional init override, then defaults above. */
export function resolveApiBaseUrl(override?: string): string {
  const base = (override || getDefaultApiBaseUrl()).trim();
  if (!base) return PRODUCTION_API_BASE_URL;
  return base.replace(/\/$/, "");
}
