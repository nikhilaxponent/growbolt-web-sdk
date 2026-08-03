import type { SDKConfig, EventPayload } from './sdk';

/**
 * The subset of the SDK that UI components need.
 *
 * Decouples React components from window.GrowBolt so the same component
 * tree can be driven by:
 *   - InlineRenderer (Phase 1): passes the real SDK instance directly
 *   - IframeHost (Phase 2): passes a thin proxy that forwards calls via postMessage
 *
 * Only add methods here that at least one UI component actually calls.
 */
export interface SDKService {
  listOffers(options?: {
    forceRefresh?: boolean;
    search?: string;
    category?: string;
    tag?: string;
    os?: string;
  }): Promise<unknown[]>;
  listCategories(options?: { forceRefresh?: boolean }): Promise<unknown[]>;
  getOfferDetails(offerId: string): Promise<unknown>;
  getOngoing(params: { sub4?: string; tab: string }): Promise<unknown>;
  redeemOffer(offerId: string): Promise<unknown>;
  emit(event: string, payload?: EventPayload): void;
  readonly config: SDKConfig | null;
  readonly sub4: string | null;
  readonly sessionId: string | null;
}
