/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SDKConfig {
  /** Required. Provided once in GrowBolt.init(). */
  apiKey: string;
  /**
   * Optional override for API origin. Normally omitted — the SDK uses its
   * built-in default (production) or build-time `VITE_API_BASE_URL`.
   */
  baseUrl?: string;
  debug?: boolean;
  timeout?: number;
  sub4?: string;
  [key: string]: any;
}

export interface Session {
  sessionId: string;
  startedAt: number;
}

export interface PublisherConfig {
  publisherId?: string;
  offerwallUrl?: string;
  campaigns?: any[];
  features?: Record<string, boolean>;
  [key: string]: any;
}

export interface SDKState {
  initialized: boolean;
  config: SDKConfig | null;
  widgetOpen: boolean;
  publisherConfig: PublisherConfig | null;
}

export interface SessionState {
  sessionId: string | null;
  startedAt: number | null;
}

export interface InitResponse {
  ok: boolean;
  session?: Session;
  publisherConfig?: PublisherConfig;
  offers?: any[];
}

export interface EventPayload {
  [key: string]: any;
}

export interface GrowBoltSDK {
  init(config?: Partial<SDKConfig>): Promise<InitResponse>;
  destroy(): Promise<{ ok: boolean }>;
  openOfferwall(opts?: { url?: string }): void;
  closeOfferwall(): void;
  on(event: string, listener: (payload?: EventPayload) => void): () => void;
  off(event: string, listener?: (payload?: EventPayload) => void): void;
  emit(event: string, payload?: EventPayload): void;
  ready(): Promise<InitResponse>;
  offers: any[] | null;
  getOffers(): any[];
  redeemOffer(offerId: string): Promise<any>;
  listOffers(options?: {
    forceRefresh?: boolean;
    search?: string;
    category?: string;
    tag?: string;
    os?: string;
  }): Promise<any[]>;
  getOfferDetails(offerId: string): Promise<any>;
  getOngoing(params: { sub4: string; tab: string }): Promise<any>;
  readonly sessionId: string | null;
  readonly config: SDKConfig | null;
}

export type SDKEventType =
  | "sdk_initialized"
  | "sdk_destroyed"
  | "widget_opened"
  | "widget_closed";
