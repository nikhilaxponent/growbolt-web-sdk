import {
  detectPlatform,
  isMobilePlatform,
  type DevicePlatform,
} from "../../utils/device";
import { openExternalUrl } from "../../utils/openExternal";
import { logger } from "../../services/logger/logger";

/** Callbacks the caller supplies to react to the claim decision. */
export interface ClaimHandlers {
  /** Show the QR-code / manual-link modal for this URL. */
  onShowModal: (url: string) => void;
}

/** Injectable dependencies — overridable in tests. */
export interface ClaimServiceDeps {
  detectPlatform: () => DevicePlatform;
  openExternalUrl: (url: string) => boolean;
  /** ms to wait for a mobile redirect to take effect before falling back. */
  redirectTimeoutMs: number;
}

const DEFAULT_REDIRECT_TIMEOUT_MS = 1500;

/**
 * Framework-agnostic decision logic for claiming an offer.
 *
 *   desktop / unknown        → show the QR modal
 *   android / ios (+tablets) → redirect to the store URL, then, if the page is
 *                              still here after redirectTimeoutMs (blocked,
 *                              in-app webview, no store handler), fall back to
 *                              the QR modal
 *
 * All browser dependencies are injected, so the decision logic is unit-testable
 * without a real DOM.
 */
export class ClaimService {
  private readonly deps: ClaimServiceDeps;

  constructor(deps: Partial<ClaimServiceDeps> = {}) {
    this.deps = {
      detectPlatform: deps.detectPlatform ?? detectPlatform,
      openExternalUrl: deps.openExternalUrl ?? openExternalUrl,
      redirectTimeoutMs: deps.redirectTimeoutMs ?? DEFAULT_REDIRECT_TIMEOUT_MS,
    };
  }

  /** Decide how to deliver an offer's tracked URL to the user. */
  claim(url: string, handlers: ClaimHandlers): void {
    if (!url) return;

    const platform = this.deps.detectPlatform();
    if (!isMobilePlatform(platform)) {
      handlers.onShowModal(url); // desktop / unknown → QR
      return;
    }

    this.redirectWithFallback(url, () => handlers.onShowModal(url));
  }

  /**
   * Attempt a mobile redirect. Invokes onFallback exactly once if the redirect
   * cannot be initiated, or if the page is still visible after the timeout.
   */
  private redirectWithFallback(url: string, onFallback: () => void): void {
    const initiated = this.deps.openExternalUrl(url);
    if (!initiated) {
      onFallback();
      return;
    }

    // No DOM to observe navigation — treat as best-effort success.
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    let settled = false;

    // Settle exactly once: either the redirect took effect (page hidden or
    // unloaded → runFallback=false) or it timed out (runFallback=true).
    const finish = (runFallback: boolean) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
      clearTimeout(timer);
      if (runFallback) {
        logger.debug("Store redirect did not take effect — showing fallback");
        onFallback();
      }
    };

    // Page hidden or unloaded ⇒ the redirect worked; cancel the fallback.
    const onLeave = () => finish(false);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") finish(false);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeave);
    const timer = setTimeout(() => finish(true), this.deps.redirectTimeoutMs);
  }
}

/** Default shared instance used by the SDK UI. */
export const claimService = new ClaimService();
