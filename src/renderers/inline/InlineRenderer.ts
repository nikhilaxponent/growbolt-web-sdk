import { createRoot, type Root } from 'react-dom/client';
import React from 'react';
import styles from '../../ui/styles.css?inline';
import { injectCSS } from '../../utils/dom';
import SDKContext from '../../ui/context/SDKContext';
import SDKLauncher from '../../ui/SDKLauncher';
import type { Renderer } from '../RendererInterface';
import type { SDKService } from '../../types/service';

const CONTAINER_ID = 'growbolt-root';
const STYLES_ID = 'growbolt-sdk-styles';

class InlineRenderer implements Renderer {
  private root: Root | null = null;

  constructor() {
    injectCSS(STYLES_ID, styles);
  }

  open(service: SDKService, _opts?: { url?: string }): void {
    // _opts is accepted to satisfy the Renderer interface contract.
    // IframeRenderer will use it for the iframe src URL.
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.zIndex = '999999';
      document.body.appendChild(container);
    }

    if (!this.root) {
      this.root = createRoot(container);
    }

    this.root.render(
      React.createElement(
        SDKContext.Provider,
        { value: service },
        React.createElement(SDKLauncher, {
          key: Date.now(),
          onClose: () => this.close(),
        }),
      ),
    );
  }

  close(): void {
    this.root?.unmount();
    this.root = null;
    document.getElementById(CONTAINER_ID)?.remove();
  }

  destroy(): void {
    this.close();
  }
}

export const inlineRenderer = new InlineRenderer();
export default inlineRenderer;
