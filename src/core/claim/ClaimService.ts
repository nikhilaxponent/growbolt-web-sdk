import {
  detectPlatform,
  isMobilePlatform,
  type DevicePlatform,
} from "../../utils/device";
import { openExternalUrl } from "../../utils/openExternal";

/** Callbacks the caller supplies to react to the claim decision. */
export interface ClaimHandlers {
  /** Show the QR / tappable-link modal for this URL. */
  onShowModal: (url: string) => void;
}

/** Injectable dependencies — overridable in tests. */
export interface ClaimServiceDeps {
  detectPlatform: () => DevicePlatform;
  openExternalUrl: (url: string) => boolean;
}

/**
 * Framework-agnostic decision logic for claiming an offer.
 *
 *   desktop / unknown        → show the QR modal (scan to continue on a phone)
 *   android / ios (+tablets) → redirect straight to the store URL
 *
 * A QR code is useless on the phone the user is already holding, so mobile
 * never shows it. The redirect is delivered via openExternalUrl; inside a
 * native WebView the host app turns that navigation into a real store launch
 * (onShouldStartLoadWithRequest → Linking.openURL, or by handling the SDK's
 * `offer_click` event). We deliberately do NOT probe for redirect success
 * with a visibilitychange/timeout fallback — those events are unreliable
 * inside WebViews and produced false QR fallbacks. Only if the redirect cannot
 * even be initiated do we surface the tappable-link modal.
 *
 * Dependencies are injected so the decision logic is unit-testable.
 */
export class ClaimService {
  private readonly deps: ClaimServiceDeps;

  constructor(deps: Partial<ClaimServiceDeps> = {}) {
    this.deps = {
      detectPlatform: deps.detectPlatform ?? detectPlatform,
      openExternalUrl: deps.openExternalUrl ?? openExternalUrl,
    };
  }

  /** Decide how to deliver an offer's tracked URL to the user. */
  claim(url: string, handlers: ClaimHandlers): void {
    if (!url) return;

    // Desktop / unknown → QR modal (scan to continue on a phone).
    if (!isMobilePlatform(this.deps.detectPlatform())) {
      handlers.onShowModal(url);
      return;
    }

    // Mobile → redirect out to the store. Never show a QR on the device the
    // user is already holding. Only fall back to the (QR-less) link modal if
    // the redirect could not even be initiated.
    const initiated = this.deps.openExternalUrl(url);
    if (!initiated) {
      handlers.onShowModal(url);
    }
  }
}

/** Default shared instance used by the SDK UI. */
export const claimService = new ClaimService();
