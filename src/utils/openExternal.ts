import { logger } from "../services/logger/logger";

/**
 * Best-effort, synchronous navigation to an external URL (e.g. a Play Store /
 * App Store link). Returns whether a navigation was *initiated* — the caller
 * (ClaimService) decides how to observe whether it actually took effect.
 *
 * Order of preference:
 *   1. iframe render mode → try top-level same-tab navigation, then fall back
 *      to a popup. The offerwall iframe sandbox blocks top-navigation but
 *      allows popups that escape the sandbox, so window.open is the reliable
 *      path there; cross-origin access to window.top.location throws and is
 *      handled.
 *   2. inline mode → same-tab navigation. This survives the preceding async
 *      redeem() call, is not subject to popup blockers, and lets the mobile OS
 *      hand https store links off to the native store app.
 *
 * @returns true if a navigation was initiated, false if it could not be.
 */
export function openExternalUrl(url: string): boolean {
  if (!url || typeof window === "undefined") return false;

  try {
    const inIframe = window.top != null && window.top !== window.self;

    if (inIframe) {
      // Prefer same-tab top-level navigation; blocked/cross-origin access
      // throws and is caught, so we fall through to a popup.
      try {
        if (window.top?.location) {
          window.top.location.assign(url);
          return true;
        }
      } catch {
        /* sandbox blocked top navigation — fall back to a popup */
      }

      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (popup) return true;
      // last resort: navigate the iframe itself
    }

    window.location.assign(url);
    return true;
  } catch (err) {
    logger.error("Failed to open external URL", err);
    return false;
  }
}
