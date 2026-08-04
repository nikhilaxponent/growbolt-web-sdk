import { logger } from "../services/logger/logger";
import { isMobilePlatform } from "./device";

/**
 * Best-effort navigation to an external URL (e.g. a Play Store / App Store link).
 * Returns true if navigation was initiated.
 *
 * Mobile / Tablet behavior:
 *   Mobile devices (phones and tablets) must NEVER be blocked by popup blockers or
 *   forced into QR code modals. If top-level navigation throws due to cross-origin
 *   iframe sandboxing, we attempt window.open, and if blocked (or on mobile), we
 *   perform a direct same-frame navigation `window.location.href = url`.
 *   On mobile WebViews and browsers, this immediately launches the store app or
 *   triggers the host WebView's navigation handler.
 *
 * Desktop behavior:
 *   Desktop attempts top-level or popup navigation. If neither is available, it returns false
 *   so ClaimService can surface the scannable QR modal.
 */
export function openExternalUrl(url: string): boolean {
  if (!url || typeof window === "undefined") return false;

  const isMobile = isMobilePlatform();

  try {
    const inIframe = window.top != null && window.top !== window.self;

    if (inIframe) {
      // 1. Try top-level same-tab navigation
      try {
        if (window.top?.location) {
          window.top.location.href = url;
          return true;
        }
      } catch {
        /* sandbox / CORS blocked top navigation */
      }

      // 2. Try window.open popup
      try {
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (popup) return true;
      } catch {
        /* popup blocked */
      }

      // 3. On mobile / tablet inside iframe:
      // Perform same-frame navigation which is guaranteed to succeed and trigger store link handoff
      if (isMobile) {
        window.location.href = url;
        return true;
      }

      return false;
    }

    // 4. Direct mode (not in an iframe)
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
