import type { GuestBridge } from './GuestBridge';
import { PostMessageGuestBridge } from './PostMessageGuestBridge';
import { AndroidGuestBridge } from './AndroidGuestBridge';
import { IOSGuestBridge } from './IOSGuestBridge';

/**
 * True when the offerwall document is embedded in a parent frame — i.e. the
 * SDK's `renderMode: "iframe"` path. In that case the offerwall MUST talk to
 * its parent (the host SDK) via postMessage, regardless of whether a native
 * WebView also exposes a bridge.
 *
 * This matters because native hosts inject their JS interfaces into EVERY frame
 * of the WebView (including our iframe). For example an Android app that adds
 * `GrowBoltAndroid.openURL(...)` for store redirects would otherwise cause the
 * offerwall to mistake that object for the guest transport and never complete
 * the postMessage handshake.
 */
function isEmbeddedInParentFrame(): boolean {
  try {
    return typeof window !== 'undefined' && window.parent !== window.self;
  } catch {
    // Cross-origin access to window.parent can throw → we are framed.
    return true;
  }
}

/**
 * A native Android guest transport is only present when the host implements the
 * full bridge protocol (`receiveMessage`). We deliberately do NOT treat the
 * mere presence of `window.GrowBoltAndroid` as a guest bridge, because the
 * store-redirect helper injects a `GrowBoltAndroid.openURL` interface that has
 * no `receiveMessage`.
 */
function hasNativeAndroidGuestBridge(): boolean {
  const w = window as unknown as {
    GrowBoltAndroid?: { receiveMessage?: unknown };
  };
  return typeof w.GrowBoltAndroid?.receiveMessage === 'function';
}

function hasNativeIOSGuestBridge(): boolean {
  const w = window as unknown as {
    webkit?: { messageHandlers?: { GrowBolt?: unknown } };
  };
  return w.webkit?.messageHandlers?.GrowBolt !== undefined;
}

export function createGuestBridge(): GuestBridge {
  // iframe renderMode (Android / iOS / Flutter / Unity WebView + browsers):
  // always reach the host SDK through the parent frame via postMessage.
  if (isEmbeddedInParentFrame()) return new PostMessageGuestBridge();

  // Standalone (non-iframe) offerwall document driven directly by a native host.
  if (hasNativeAndroidGuestBridge()) return new AndroidGuestBridge();
  if (hasNativeIOSGuestBridge()) return new IOSGuestBridge();

  // Fallback: a top-level document with no native host. postMessage is a safe
  // no-op target here; nothing else can drive the offerwall.
  return new PostMessageGuestBridge();
}
