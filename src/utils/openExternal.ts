import { logger } from "../services/logger/logger";
import { isMobilePlatform } from "./device";

interface NativeHostWindow {
  /** Explicit opt-in flag a React Native host sets once it handles openURL. */
  growboltNativeOpen?: boolean;
  ReactNativeWebView?: { postMessage?: (msg: string) => void };
  webkit?: {
    messageHandlers?: { growbolt?: { postMessage?: (msg: unknown) => void } };
  };
  GrowBoltAndroid?: { openURL?: (url: string) => void };
}

/**
 * When running inside a native WebView host that has opted in, hand the URL to
 * the host to open and return true.
 *
 * WHY: inside a WebView we must NOT open a store link via window.location.
 * Android/iOS WebViews intercept programmatic navigations inconsistently
 * (shouldOverrideUrlLoading / onShouldStartLoadWithRequest do not fire reliably
 * for window.location changes), so the same tap sometimes opens the store app,
 * sometimes loads the store web page inside the WebView, and sometimes errors
 * with ERR_UNKNOWN_URL_SCHEME on market:// links. Handing the URL to the host
 * makes it open exactly once via the OS (Intent / Linking / UIApplication.open),
 * which reliably resolves the tracker redirect chain and launches the store.
 *
 * Opt-in is required so existing hosts that don't implement a handler keep the
 * previous navigation behavior (non-breaking):
 *   - React Native : set window.growboltNativeOpen = true, then onMessage →
 *                    {type:"growbolt:openURL", url} → Linking.openURL
 *   - iOS WKWebView: register a "growbolt" script message handler →
 *                    UIApplication.shared.open
 *   - Android      : addJavascriptInterface(obj, "GrowBoltAndroid") with
 *                    openURL(url) → startActivity(ACTION_VIEW)
 */
function requestNativeOpen(url: string): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as NativeHostWindow;

  // Android JS interface and iOS message handler exist only when the host
  // registered them, so they are inherently opt-in. React Native's
  // ReactNativeWebView is always present, so it additionally requires the
  // explicit growboltNativeOpen flag.
  const androidBridge = typeof w.GrowBoltAndroid?.openURL === "function";
  const iosBridge =
    typeof w.webkit?.messageHandlers?.growbolt?.postMessage === "function";
  const rnBridge =
    w.growboltNativeOpen === true &&
    typeof w.ReactNativeWebView?.postMessage === "function";

  if (!androidBridge && !iosBridge && !rnBridge) return false;

  const payload = JSON.stringify({ type: "growbolt:openURL", url });
  try {
    if (androidBridge) {
      w.GrowBoltAndroid!.openURL!(url);
      return true;
    }
    if (iosBridge) {
      w.webkit!.messageHandlers!.growbolt!.postMessage!(payload);
      return true;
    }
    w.ReactNativeWebView!.postMessage!(payload);
    return true;
  } catch (err) {
    logger.error("Native open bridge failed", err);
    return false;
  }
}

/**
 * Open an external URL (e.g. a Play Store / App Store link) in the most
 * reliable way for the current context.
 *
 *   1. Native WebView host (opted in) → host opens it exactly once.
 *   2. iframe render mode             → top-level navigation, then popup.
 *   3. Plain web / mobile browser     → same-frame navigation.
 *
 * Returns true if the open was initiated, false if it could not be (so
 * ClaimService can surface the QR modal on desktop).
 */
export function openExternalUrl(url: string): boolean {
  if (!url || typeof window === "undefined") return false;

  // 1. Native WebView host — deterministic single open, no WebView navigation.
  if (requestNativeOpen(url)) return true;

  const isMobile = isMobilePlatform();

  try {
    const inIframe = window.top != null && window.top !== window.self;

    if (inIframe) {
      // Try top-level same-tab navigation.
      try {
        if (window.top?.location) {
          window.top.location.href = url;
          return true;
        }
      } catch {
        /* sandbox / CORS blocked top navigation */
      }
      // Try a popup that escapes the offerwall iframe sandbox.
      try {
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (popup) return true;
      } catch {
        /* popup blocked */
      }
      // Mobile inside an iframe: same-frame navigation reliably hands off.
      if (isMobile) {
        window.location.href = url;
        return true;
      }
      return false;
    }

    // 4. Not in an iframe (inline mobile browser / desktop).
    window.location.href = url;
    return true;
  } catch (err) {
    logger.error("Failed to open external URL", err);
    if (isMobile) {
      try {
        window.location.href = url;
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
