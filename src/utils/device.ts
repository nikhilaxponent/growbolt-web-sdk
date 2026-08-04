// Device / platform detection for the GrowBolt Web SDK.
//
// Used to decide how an offer's store link is delivered:
//   desktop        → show a scannable QR code
//   android / ios  → redirect straight to the store (phones AND tablets)
//
// Kept as pure, side-effect-free functions so they can be unit-tested with
// user-agent fixtures and safely called in non-browser contexts.

export type DevicePlatform = "android" | "ios" | "desktop" | "unknown";

interface UserAgentDataLike {
  platform?: string;
  mobile?: boolean;
}

function getNavigator(): Navigator | undefined {
  return typeof navigator !== "undefined" ? navigator : undefined;
}

/**
 * Detect the current OS platform.
 *
 * Reliability notes:
 * - Android phones and tablets both include "android" in the UA.
 * - iPadOS 13+ masquerades as desktop Safari ("Macintosh") — we disambiguate
 *   it via touch-point support, so iPads are correctly treated as iOS.
 * - Chromium User-Agent Client Hints are used when present (most reliable).
 * - Comprehensive mobile/tablet UA & touch checks catch Android tablets, Kindle, Mobile WebViews.
 */
export function detectPlatform(): DevicePlatform {
  const nav = getNavigator();
  if (!nav) return "unknown";

  const ua = (nav.userAgent || "").toLowerCase();

  // 1. Chromium Client Hints — authoritative when available.
  const uaData = (nav as Navigator & { userAgentData?: UserAgentDataLike })
    .userAgentData;
  if (uaData?.platform?.toLowerCase() === "android" || uaData?.mobile === true) {
    return "android";
  }

  // 2. Android (phones + tablets).
  if (/android/.test(ua)) return "android";

  // 3. iPhone / iPod.
  if (/iphone|ipod/.test(ua)) return "ios";

  // 4. iPad — legacy UA ("ipad") or iPadOS 13+ desktop-masquerade.
  const looksLikeMac = /ipad|macintosh|mac os x/.test(ua);
  const isTouchMac =
    typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 1;
  if (/ipad/.test(ua) || (looksLikeMac && isTouchMac)) return "ios";

  // 5. General mobile & tablet UA check (Kindle, Silk, Opera Mini, Mobile Safari, Blackberry, etc.)
  if (
    /mobile|tablet|kindle|silk|opera mini|cobalt|android|iphone|ipad|ipod|blackberry|iemobile|webos/i.test(
      ua,
    )
  ) {
    return "android";
  }

  // 6. Touch-screen mobile/tablet viewport heuristic
  if (
    typeof nav.maxTouchPoints === "number" &&
    nav.maxTouchPoints > 0 &&
    typeof window !== "undefined" &&
    (window.innerWidth <= 1024 || window.innerHeight <= 1024)
  ) {
    return "android";
  }

  return "desktop";
}

/** True for Android or iOS (phones and tablets). */
export function isMobilePlatform(
  platform: DevicePlatform = detectPlatform(),
): boolean {
  return platform === "android" || platform === "ios";
}
