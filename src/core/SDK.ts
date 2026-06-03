/* eslint-disable @typescript-eslint/no-explicit-any */
import { init as initFn } from "./lifecycle/init";
import { destroy as destroyFn } from "./lifecycle/destroy";
import { emitter } from "./events/emitter";
import widget from "../modules/widget/widget";
import { sdkState } from "./state/sdkState";
import { sessionState } from "./state/sessionState";
import { logger } from "../services/logger/logger";
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

    this.initPromise = initFn(config).catch((err) => {
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
      logger.warn("openOfferwall: SDK not initialized");
      return;
    }
    widget.openOfferwall(opts);
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
    return sdkState.offers;
  }

  getOffers(): any[] {
    return sdkState.offers || [];
  }

  async listOffers(options?: { forceRefresh?: boolean }): Promise<any[]> {
    if (!sdkState.initialized) throw new Error("SDK not initialized");
    if (sdkState.offers && !options?.forceRefresh) {
      return sdkState.offers;
    }
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const scheme =
      (sdkState.config && (sdkState.config as any).apiKeyScheme) || "SdkToken";
    const apiKey = sdkState.config?.apiKey;
    const path = "/api/v1/sdk/offers/";
    const resp = await api.get(path, {
      headers: { Authorization: `${scheme} ${String(apiKey)}` },
    });
    let offersList: any[] = [];
    if (resp && Array.isArray(resp.offers)) {
      offersList = resp.offers;
    } else if (Array.isArray(resp)) {
      offersList = resp;
    }
    sdkState.offers = offersList;
    return offersList;
  }

  // Fetch ongoing items for a given sub4 and tab (completed|pending|failed)
  async getOngoing(params: { sub4: string; tab: string }) {
    if (!sdkState.initialized) throw new Error("SDK not initialized");
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const { sub4, tab } = params;
    const q = `?sub4=${encodeURIComponent(sub4)}&tab=${encodeURIComponent(tab)}`;
    const path = `/api/v1/sdk/ongoing/${q}`;
    const scheme =
      (sdkState.config && (sdkState.config as any).apiKeyScheme) || "SdkToken";
    const apiKey = sdkState.config?.apiKey;
    return api.get(path, {
      headers: { Authorization: `${scheme} ${String(apiKey)}` },
    });
  }

  // Fetch offer details by offerId
  async getOfferDetails(offerId: string) {
    if (!sdkState.initialized) throw new Error("SDK not initialized");
    const api: any = (sdkState as any).apiClient;
    if (!api) throw new Error("API client not available");
    const scheme =
      (sdkState.config && (sdkState.config as any).apiKeyScheme) || "SdkToken";
    const apiKey = sdkState.config?.apiKey;
    const path = `/api/v1/sdk/offers/${encodeURIComponent(offerId)}/`;

    return api.get(path, {
      headers: { Authorization: `${scheme} ${String(apiKey)}` },
    });
  }

  get sessionId(): string | null {
    return sessionState.sessionId;
  }

  get config(): SDKConfig | null {
    return sdkState.config;
  }
}
