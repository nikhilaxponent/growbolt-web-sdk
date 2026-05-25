import { init as initFn } from "./lifecycle/init";
import { destroy as destroyFn } from "./lifecycle/destroy";
import { emitter } from "./events/emitter";
import widget from "../modules/widget/widget";
import { sdkState } from "./state/sdkState";
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
}
