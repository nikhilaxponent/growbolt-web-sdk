import { createRenderer } from '../../renderers/RendererFactory';
import type { Renderer } from '../../renderers/RendererInterface';
import type { SDKService } from '../../types/service';

let activeRenderer: Renderer | null = null;

export function openOfferwall(
  opts: { url?: string } | undefined,
  service: SDKService,
): void {
  activeRenderer = createRenderer({
    renderMode: service.config?.renderMode,
    offerwallUrl: service.config?.offerwallUrl,
  });
  activeRenderer.open(service, opts);
}

export function closeOfferwall(): void {
  activeRenderer?.close();
}

export function destroyWidget(): void {
  activeRenderer?.destroy();
  activeRenderer = null;
}

export default { openOfferwall, closeOfferwall, destroyWidget };
