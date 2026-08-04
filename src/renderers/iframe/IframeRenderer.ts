import type { Renderer } from '../RendererInterface';
import type { SDKService } from '../../types/service';
import { PostMessageBridge } from '../../bridge/PostMessageBridge';
import { sdkState } from '../../core/state/sdkState';
import { emitter } from '../../core/events/emitter';

const OVERLAY_ID = 'growbolt-iframe-overlay';
const SPIN_STYLE_ID = 'growbolt-spin-keyframes';
export const DEFAULT_OFFERWALL_URL =
  'https://sdk.growbolt.ai/offerwall/offerwall.html';

export class IframeRenderer implements Renderer {
  private offerwallUrl: string;
  private overlay: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private bridge: PostMessageBridge | null = null;

  constructor(offerwallUrl?: string) {
    this.offerwallUrl = offerwallUrl ?? DEFAULT_OFFERWALL_URL;
  }

  open(service: SDKService, _opts?: { url?: string }): void {
    if (this.overlay !== null) return;

    // ── Keyframe animation (injected once) ──────────────────────────────────
    if (document.getElementById(SPIN_STYLE_ID) === null) {
      const style = document.createElement('style');
      style.id = SPIN_STYLE_ID;
      style.textContent =
        '@keyframes gb-spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // ── Overlay (backdrop + spinner) ────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '999999',
      background: 'rgba(0,0,0,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Loading GrowBolt Offerwall');

    const spinner = document.createElement('div');
    spinner.setAttribute('aria-hidden', 'true');
    Object.assign(spinner.style, {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid #ffffff',
      borderRadius: '50%',
      animation: 'gb-spin 0.7s linear infinite',
    });
    overlay.appendChild(spinner);

    // ── Hidden iframe ────────────────────────────────────────────────────────
    const iframe = document.createElement('iframe');
    iframe.src = this.offerwallUrl;
    iframe.title = 'GrowBolt Offerwall';
    // allow-same-origin is required: without it the browser assigns the iframe
    // a null opaque origin, so event.origin === "null" on both sides and all
    // postMessage origin checks fail silently (GB_READY never delivered).
    // The offerwall bundle is our own trusted code so this is safe.
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
    );
    Object.assign(iframe.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: 'none',
      display: 'none',
    });
    overlay.appendChild(iframe);

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.iframe = iframe;

    // ── Bridge ───────────────────────────────────────────────────────────────
    // Resolve relative URLs (e.g. "./offerwall/offerwall.html") against the
    // current page so that new URL() never throws on a relative-only string.
    let resolvedUrl: URL;
    try {
      resolvedUrl = new URL(this.offerwallUrl, window.location.href);
    } catch {
      this.callbacks_onError('[GrowBolt] Invalid offerwallUrl: ' + this.offerwallUrl);
      return;
    }
    const iframeOrigin = resolvedUrl.origin;

    this.bridge = new PostMessageBridge(iframe, iframeOrigin, service, {
      onReady: () => {
        this.bridge?.sendInit({
          sub4: service.sub4,
          sessionId: service.sessionId,
          config: (service.config as unknown as Record<string, unknown>) ?? {},
        });
      },
      onAppReady: () => {
        spinner.style.display = 'none';
        iframe.style.display = 'block';
        sdkState.widgetOpen = true;
        emitter.emit('widget_opened');
      },
      onClose: () => {
        this.close();
      },
      onError: (msg) => {
        this.callbacks_onError(msg);
      },
    });
  }

  private callbacks_onError(msg: string): void {
    console.error(msg);
    this.close();
  }

  close(): void {
    this.bridge?.destroy();
    this.bridge = null;
    this.overlay?.remove();
    this.overlay = null;
    this.iframe = null;
    if (sdkState.widgetOpen) {
      sdkState.widgetOpen = false;
      emitter.emit('widget_closed');
    }
  }

  destroy(): void {
    this.close();
  }
}
