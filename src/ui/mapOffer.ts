/* eslint-disable @typescript-eslint/no-explicit-any */
import { toPlainText } from "../utils/sanitizeContent";

export function formatAmount(value: string | number | undefined) {
  const num = Number(value || 0);
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
}

export function deriveUiCategory(offer: any): "apps" | "games" | undefined {
  const tags = (offer?.tags || []).map((t: unknown) => String(t).toLowerCase());
  const categories = (offer?.full_categories || []).map((c: any) => {
    if (c && typeof c === "object") {
      return String(c.title || c.id || "").toLowerCase();
    }
    return String(c || "").toLowerCase();
  });
  const haystack = [...tags, ...categories].join(" ");
  if (/\bgame/.test(haystack)) return "games";
  if (/\bapp/.test(haystack)) return "apps";
  return undefined;
}

export function mapApiOfferToModel(offer: any) {
  const title =
    typeof offer.title === "object"
      ? offer.title?.en || Object.values(offer.title)[0] || ""
      : offer.title || "";

  const osKeys = Object.keys(offer?.strictly_os?.items || {});
  const deviceLabel = osKeys.join(", ");
  const primaryOs = osKeys[0]?.toLowerCase() || "";

  const payoutTotal =
    offer?.payout?.total ??
    offer?.payments?.[0]?.total ??
    offer?.payments?.[0]?.revenue;

  return {
    id: String(offer.id),
    name: title.length > 20 ? `${title.substring(0, 20)}...` : title,
    subtitle: toPlainText(
      offer.payout?.title ||
        offer.payments?.[0]?.title ||
        offer.description ||
        "Complete offer and earn rewards",
    ),
    logo: offer.logo,
    earn: `₹${formatAmount(payoutTotal)}`,
    duration:
      offer?.expiry_days > 0
        ? `${offer.expiry_days} ${
            offer?.expiry_type === "hours" ? "Hours" : "Days"
          }`
        : "Instant",
    device: deviceLabel,
    deviceOs: primaryOs,
    category: deriveUiCategory(offer),
    payoutType: offer.is_cpi ? "cpi" : "cpa",
    createdAt: offer.start_at || offer.created_at,
    raw: offer,
  };
}
