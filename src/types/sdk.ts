/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  debug?: boolean;
  timeout?: number;
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
  listOffers(options?: { forceRefresh?: boolean }): Promise<any[]>;
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
