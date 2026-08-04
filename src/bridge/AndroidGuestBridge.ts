import { isGBMessage } from './BridgeProtocol';
import type { GuestToHostMessage, HostToGuestMessage } from './BridgeProtocol';
import { BaseGuestBridge } from './GuestBridge';

// Guest-side bridge for Android WebView environments.
//
// Transport contract for native Android developers:
//   JS → Native: window.GrowBoltAndroid.receiveMessage(jsonString)
//   Native → JS: webView.evaluateJavascript("window.__gbOnNativeMessage('" + escapedJson + "')", null)
//
// The native host must inject a @JavascriptInterface object named "GrowBoltAndroid"
// and implement the same BridgeProtocol message types as the iframe host.
export class AndroidGuestBridge extends BaseGuestBridge {
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
    const android = (window as unknown as Record<string, { receiveMessage(json: string): void }>)
      .GrowBoltAndroid;
    android.receiveMessage(JSON.stringify(msg));
  }

  destroy(): void {
    delete (window as unknown as Record<string, unknown>).__gbOnNativeMessage;
    this.destroyBase();
  }
}
