import type { Renderer } from './RendererInterface';
import { inlineRenderer } from './inline/InlineRenderer';
import { IframeRenderer } from './iframe/IframeRenderer';

export interface RendererConfig {
  renderMode?: 'inline' | 'iframe';
  offerwallUrl?: string;
}

export function createRenderer(config: RendererConfig): Renderer {
  if (config.renderMode === 'iframe') {
    return new IframeRenderer(config.offerwallUrl);
  }
  return inlineRenderer;
}
