import type { SDKService } from '../types/service';

/**
 * Contract that every renderer must satisfy.
 *
 * Phase 1: InlineRenderer — mounts React directly into the host DOM.
 * Phase 2: IframeRenderer — creates an <iframe>, transfers config via
 *          postMessage, and proxies events back to the host page.
 */
export interface Renderer {
  open(service: SDKService, opts?: { url?: string }): void;
  close(): void;
  destroy(): void;
}
