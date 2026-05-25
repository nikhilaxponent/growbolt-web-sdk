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

  async request(path: string, opts: RequestInit = {}) {
    const url = this.buildUrl(path);
    const init: RequestInit = Object.assign({}, opts, {
      credentials: this.credentials,
      headers: Object.assign({}, this.headers, opts.headers || {}),
    });
    const res = await fetch(url, init);
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
    if (!res.ok) {
      const err: any = new Error(`API error ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  get(path: string) {
    return this.request(path, { method: "GET" });
  }

  post(path: string, body?: any) {
    return this.request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export default ApiClient;
