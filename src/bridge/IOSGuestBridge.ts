import { isGBMessage } from './BridgeProtocol';
import type { GuestToHostMessage, HostToGuestMessage } from './BridgeProtocol';
import { BaseGuestBridge } from './GuestBridge';

// Guest-side bridge for iOS WKWebView environments.
//
// Transport contract for native iOS developers:
//   JS → Native: window.webkit.messageHandlers.GrowBolt.postMessage(jsonString)
//   Native → JS: webView.evaluateJavaScript("window.__gbOnNativeMessage('\(escapedJson)')")
//
// The native host must add a WKScriptMessageHandler named "GrowBolt" and
// implement the same BridgeProtocol message types as the iframe host.
export class IOSGuestBridge extends BaseGuestBridge {
  constructor() {
    super();
    (window as unknown as Record<string, unknown>).__gbOnNativeMessage = (json: string) => {
      try {
        const msg = JSON.parse(json) as unknown;
        if (isGBMessage(msg)) {
          this.handleIncoming(msg as HostToGuestMessage);
        }
      } catch {
        // Ignore malformed messages from native layer.
      }
    };
  }

  protected sendRaw(msg: GuestToHostMessage): void {
    const w = window as unknown as {
      webkit: { messageHandlers: { GrowBolt: { postMessage(json: string): void } } };
    };
    w.webkit.messageHandlers.GrowBolt.postMessage(JSON.stringify(msg));
  }

  destroy(): void {
    delete (window as unknown as Record<string, unknown>).__gbOnNativeMessage;
    this.destroyBase();
  }
}
