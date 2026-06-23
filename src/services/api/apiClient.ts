import { APIError } from "../../types/errors";
import { sdkState } from "../../core/state/sdkState";

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  credentials?: "include" | "omit" | "same-origin";
}

export class ApiClient {
  baseUrl: string;
  headers: Record<string, string>;
  credentials: RequestCredentials;

  constructor(opts?: ApiClientOptions) {
    this.baseUrl = opts?.baseUrl?.replace(/\/$/, "") || "";
    this.headers = Object.assign(
      { "Content-Type": "application/json" },
      opts?.headers || {},
    );
    this.credentials = opts?.credentials || "omit";
  }

  private buildUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    if (!this.baseUrl) return path;
    return `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  async request(path: string, opts: RequestInit = {}, retries = 2): Promise<any> {
    const sub4 = sdkState.user?.sub4 || sdkState.config?.sub4 || undefined;
    const endpoint = path.split("?")[0];
    console.log("[GrowBolt] API Request", { endpoint, sub4 });

    let finalPath = path;
    if (sub4) {
      const hasSub4 = /[?&]sub4=/.test(path);
      if (!hasSub4) {
        const separator = path.includes("?") ? "&" : "?";
        finalPath = `${path}${separator}sub4=${encodeURIComponent(sub4)}`;
      }
    }
    const url = this.buildUrl(finalPath);
    const init: RequestInit = Object.assign({}, opts, {
      credentials: this.credentials,
      headers: Object.assign({}, this.headers, opts.headers || {}),
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, init);
        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          console.warn("Failed to parse JSON response, returning raw text", e);
          data = text;
        }
        if (!res.ok) {
          throw new APIError(
            `API error ${res.status} ${res.statusText}`,
            res.status,
            data,
          );
        }
        return data;
      } catch (err: any) {
        // If we ran out of retries, or if it is a client-side 4xx error (not worth retrying), throw immediately
        const isClientError =
          err instanceof APIError &&
          err.status &&
          err.status >= 400 &&
          err.status < 500;
        if (attempt === retries || isClientError) {
          throw err;
        }
        // Wait with exponential backoff: 500ms, 1000ms, etc.
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  get(path: string, opts: RequestInit = {}) {
    return this.request(path, Object.assign({}, opts, { method: "GET" }));
  }

  post(path: string, body?: any, opts: RequestInit = {}) {
    const init = Object.assign({}, opts, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.request(path, init);
  }
}

export default ApiClient;
