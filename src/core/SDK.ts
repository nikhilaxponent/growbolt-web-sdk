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
    console.log("[GrowBolt] Opening offerwall", { sub4 });

    let finalOpts = opts;
    if (opts?.url && sub4) {
      try {
        const u = new URL(opts.url);
        u.searchParams.set("sub4", sub4);
        u.searchParams.set("subid4", sub4);
        finalOpts = { ...opts, url: u.toString() };
      } catch {
        // ignore
      }
    }
    widget.openOfferwall(finalOpts);
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
    // wait for sdk_initialized event
    return new Promise((resolve, reject) => {
      const unsubscribe = this.on("sdk_initialized", (payload: any) => {
        unsubscribe();
        resolve({
          ok: true,
          session: payload.session,
          publisherConfig: payload.publisherConfig,
        });
      });
      // timeout after 30s
      setTimeout(() => {
        unsubscribe();
        reject(new Error("SDK ready timeout"));
      }, 30000);
    });
  }

  // Get all offers loaded during initialization
  get offers(): any[] | null {
    return this.getOffers();
  }

  getOffers(): any[] {
    const offers = sdkState.offers || [];
    const sub4 = sdkState.user?.sub4 || sdkState.config?.sub4;
    if (!sub4) return offers;

    const appendSub4 = (urlStr: string) => {
      if (!urlStr) return urlStr;
      try {
        const u = new URL(urlStr);
        u.searchParams.set("sub4", sub4);
        u.searchParams.set("subid4", sub4);
        return u.toString();
      } catch {
        return urlStr;
      }
    };

    return offers.map((offer: any) => {
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
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const params = new URLSearchParams();

    if (options?.search) {
      params.append("search", options.search);
    }

    if (options?.category) {
      params.append("category", options.category);
    }

    if (options?.tag) {
      params.append("tag", options.tag);
    }

    if (options?.os) {
      params.append("os", options.os);
    }

    const query = params.toString();

    const path = query ? `/api/v1/sdk/offers/?${query}` : "/api/v1/sdk/offers/";
    const resp = await api.get(path, {
      headers: getSdkAuthHeaders(),
    });
    let offersList: any[] = [];
    if (resp && Array.isArray(resp.offers)) {
      offersList = resp.offers;
    } else if (resp && Array.isArray(resp.results)) {
      offersList = resp.results;
    } else if (Array.isArray(resp)) {
      offersList = resp;
    }
    // Keep the unfiltered catalog in sdkState; filtered fetches are ephemeral.
    if (!hasFilters) {
      sdkState.offers = offersList;
    }
    return this.getOffers();
  }

  // Fetch ongoing items for a given sub4 and tab (completed|pending|failed)
  async getOngoing(params: { sub4?: string; tab: string }) {
    assertInitialized();
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const sub4 = params.sub4 || sdkState.user?.sub4 || "";
    const { tab } = params;
    const q = `?sub4=${encodeURIComponent(sub4)}&tab=${encodeURIComponent(tab)}`;
    const path = `/api/v1/sdk/ongoing/${q}`;
    return api.get(path, {
      headers: getSdkAuthHeaders(),
    });
  }

  // Fetch offer details by offerId
  async getOfferDetails(offerId: string) {
    assertInitialized();
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const path = `/api/v1/sdk/offers/${encodeURIComponent(offerId)}/`;

    return api.get(path, {
      headers: getSdkAuthHeaders(),
    });
  }

  async redeemOffer(offerId: string) {
    assertInitialized();
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");

    const path = `/api/v1/sdk/offers/${encodeURIComponent(offerId)}/redeem/`;

    return api.post(path, undefined, {
      headers: getSdkAuthHeaders(),
    });
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
    console.log("[GrowBolt] User identified", { sub4 });
  }

  reset(): void {
    sdkState.user = null;
    if (sdkState.config) {
      sdkState.config.sub4 = undefined;
    }
    storage.storageRemove("user");
    console.log("[GrowBolt] User reset");
  }

  get user(): { sub4?: string; [key: string]: any } | null {
    return sdkState.user;
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
