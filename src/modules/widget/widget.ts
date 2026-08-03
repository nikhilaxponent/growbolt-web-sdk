import { inlineRenderer } from '../../renderers/inline/InlineRenderer';
import type { SDKService } from '../../types/service';

export function openOfferwall(opts: { url?: string } | undefined, service: SDKService): void {
  inlineRenderer.open(service, opts);
}

export function closeOfferwall(): void {
  inlineRenderer.close();
}

export default { openOfferwall, closeOfferwall };
