/* eslint-disable @typescript-eslint/no-explicit-any */
import { init as initFn } from "./lifecycle/init";
import { destroy as destroyFn } from "./lifecycle/destroy";
import { emitter } from "./events/emitter";
import widget from "../modules/widget/widget";
import { sdkState } from "./state/sdkState";
import { sessionState } from "./state/sessionState";
import { logger } from "../services/logger/logger";
import { assertInitialized, getSdkAuthHeaders } from "./api/auth";
import storage from "../services/storage/storage";
import type {
  InitResponse,
  SDKConfig,
  EventPayload,
  GrowBoltSDK,
} from "../types/sdk";

export class SDK implements GrowBoltSDK {
  private initPromise: Promise<InitResponse> | null = null;
  private eventQueue: Array<{
    event: string;
    listener: (payload?: any) => void;
  }> = [];

  init(config?: Partial<SDKConfig>): Promise<InitResponse> {
    if (this.initPromise) {
      logger.warn("init already called, returning existing promise");
      return this.initPromise;
    }

    this.initPromise = initFn(config)
      .then((res) => {
        if (config?.sub4) {
          console.warn(
            "[GrowBolt] Deprecation Warning: Passing sub4 in init() is deprecated. Please use GrowBolt.identify({ sub4 }) instead.",
          );
          this.identify({ sub4: config.sub4 });
        }
        return res;
      })
      .catch((err) => {
        this.initPromise = null;
        throw err;
      });

    return this.initPromise;
  }

  destroy(): Promise<{ ok: boolean }> {
    this.initPromise = null;
    this.eventQueue = [];
    return destroyFn();
  }

  openOfferwall(opts?: { url?: string }): void {
    if (!sdkState.initialized) {
      logger.error(
        "openOfferwall: call GrowBolt.init({ apiKey }) before opening the offerwall",
      );
      return;
    }
    const sub4 = sdkState.user?.sub4 || sdkState.config?.sub4 || null;

    let finalOpts = opts;
    if (opts?.url && sub4) {
      try {
        const u = new URL(opts.url);
        u.searchParams.set("sub4", String(sub4));
        u.searchParams.set("subid4", String(sub4));
        finalOpts = { ...opts, url: u.toString() };
      } catch {
        // ignore malformed URLs
      }
    }
    widget.openOfferwall(finalOpts, this);
  }

  closeOfferwall(): void {
    widget.closeOfferwall();
  }

  on(event: string, listener: (payload?: EventPayload) => void): () => void {
    return emitter.on(event, listener);
  }

  off(event: string, listener?: (payload?: EventPayload) => void): void {
    emitter.off(event, listener);
  }

  emit(event: string, payload?: EventPayload): void {
    emitter.emit(event, payload);
  }

  async ready(): Promise<InitResponse> {
    if (this.initPromise) {
      return this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const unsubscribe = this.on("sdk_initialized", (payload: any) => {
        unsubscribe();
        resolve({
          ok: true,
          session: payload.session,
          publisherConfig: payload.publisherConfig,
        });
      });
      setTimeout(() => {
        unsubscribe();
        reject(new Error("SDK ready timeout"));
      }, 30000);
    });
  }

  get offers(): any[] | null {
    return this.getOffers();
  }

  getOffers(): any[] {
    const offers = sdkState.offers || [];
    const sub4 = sdkState.user?.sub4 || sdkState.config?.sub4;
    if (!sub4) return offers as any[];

    const appendSub4 = (urlStr: string) => {
      if (!urlStr) return urlStr;
      try {
        const u = new URL(urlStr);
        u.searchParams.set("sub4", String(sub4));
        u.searchParams.set("subid4", String(sub4));
        return u.toString();
      } catch {
        return urlStr;
      }
    };

    return (offers as any[]).map((offer: any) => {
      const updated = { ...offer };
      if (updated.url) updated.url = appendSub4(updated.url);
      if (updated.click_url) updated.click_url = appendSub4(updated.click_url);
      if (updated.preview_url) updated.preview_url = appendSub4(updated.preview_url);
      if (updated.raw) {
        updated.raw = { ...updated.raw };
        if (updated.raw.url) updated.raw.url = appendSub4(updated.raw.url);
        if (updated.raw.click_url) updated.raw.click_url = appendSub4(updated.raw.click_url);
        if (updated.raw.preview_url) updated.raw.preview_url = appendSub4(updated.raw.preview_url);
      }
      return updated;
    });
  }

  async listOffers(options?: {
    forceRefresh?: boolean;
    search?: string;
    category?: string;
    tag?: string;
    os?: string;
  }): Promise<any[]> {
    assertInitialized();
    const hasFilters =
      options?.search || options?.category || options?.tag || options?.os;

    if (sdkState.offers && !options?.forceRefresh && !hasFilters) {
      return this.getOffers();
    }

    const api = sdkState.apiClient;
    if (!api) throw new Error("API client not available");

    const params = new URLSearchParams();
    if (options?.search) params.append("search", options.search);
    if (options?.category) params.append("category", options.category);
    if (options?.tag) params.append("tag", options.tag);
    if (options?.os) params.append("os", options.os);

    const query = params.toString();
    const path = query ? `/api/v1/sdk/offers/?${query}` : "/api/v1/sdk/offers/";
    const resp = await api.get(path, { headers: getSdkAuthHeaders() });

    let offersList: any[] = [];
    if (resp && Array.isArray(resp.offers)) {
      offersList = resp.offers;
    } else if (resp && Array.isArray(resp.results)) {
      offersList = resp.results;
    } else if (Array.isArray(resp)) {
      offersList = resp;
    }

    if (!hasFilters) {
      sdkState.offers = offersList;
    }
    return this.getOffers();
  }

  async listCategories(_options?: { forceRefresh?: boolean }): Promise<any[]> {
    assertInitialized();
    const api = sdkState.apiClient;
    if (!api) throw new Error("API client not available");

    const resp = await api.get(`/api/v1/sdk/offers/categories/`, {
      headers: getSdkAuthHeaders(),
    });

    let categoriesList: any[] = [];
    if (resp && Array.isArray(resp.categories)) {
      categoriesList = resp.categories;
    } else if (Array.isArray(resp)) {
      categoriesList = resp;
    }

    return categoriesList.map((item: any) => ({
      id: String(item.id),
      title: item.title || "",
      count: Number(item.count) || 0,
    }));
  }

  async getOngoing(params: { sub4?: string; tab: string }) {
    assertInitialized();
    const api = sdkState.apiClient;
    if (!api) throw new Error("API client not available");

    const sub4 = params.sub4 || sdkState.user?.sub4 || "";
    const { tab } = params;
    const q = `?sub4=${encodeURIComponent(String(sub4))}&tab=${encodeURIComponent(tab)}`;
    return api.get(`/api/v1/sdk/ongoing/${q}`, { headers: getSdkAuthHeaders() });
  }

  async getOfferDetails(offerId: string) {
    assertInitialized();
    const api = sdkState.apiClient;
    if (!api) throw new Error("API client not available");

    return api.get(`/api/v1/sdk/offers/${encodeURIComponent(offerId)}/`, {
      headers: getSdkAuthHeaders(),
    });
  }

  async redeemOffer(offerId: string) {
    assertInitialized();
    const api = sdkState.apiClient;
    if (!api) throw new Error("API client not available");

    return api.post(
      `/api/v1/sdk/offers/${encodeURIComponent(offerId)}/redeem/`,
      undefined,
      { headers: getSdkAuthHeaders() },
    );
  }

  identify(params: { sub4: string }): void {
    if (!params || typeof params.sub4 !== "string" || params.sub4.trim().length === 0) {
      throw new Error("GrowBolt.identify: sub4 must be a non-empty string");
    }
    const sub4 = params.sub4;
    const user = { sub4 };
    sdkState.user = user;
    if (sdkState.config) {
      sdkState.config.sub4 = sub4;
    }
    storage.storageSet("user", user);
  }

  reset(): void {
    sdkState.user = null;
    if (sdkState.config) {
      sdkState.config.sub4 = undefined;
    }
    storage.storageRemove("user");
  }

  get user(): { sub4?: string; [key: string]: any } | null {
    return sdkState.user as { sub4?: string; [key: string]: any } | null;
  }

  get sub4(): string | null {
    return sdkState.user?.sub4 || null;
  }

  get sessionId(): string | null {
    return sessionState.sessionId;
  }

  get config(): SDKConfig | null {
    return sdkState.config;
  }
}
