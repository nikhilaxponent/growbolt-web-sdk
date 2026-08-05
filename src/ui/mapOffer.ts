/* eslint-disable @typescript-eslint/no-explicit-any */
import { toPlainText } from "../utils/sanitizeContent";

export function formatAmount(value: string | number | undefined): string {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0";
  if (Math.abs(num) >= 1000) {
    const formatted = (num / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  if (num >= 100) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
}

export function getCurrencySymbol(currencyStr: string | undefined): string {
  if (!currencyStr) return "₹";
  const normalized = currencyStr.trim().toUpperCase();
  return normalized === "INR" || normalized === "₹" ? "₹" : "$";
}

export function matchesCategory(offerModel: any, selectedCategory: string): boolean {
  if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
    return true;
  }

  const sel = selectedCategory.toLowerCase().trim();
  const raw = offerModel?.raw || offerModel || {};

  const fullCats: any[] = raw.full_categories || raw.categories || raw.tags || [];

  if (!Array.isArray(fullCats) || fullCats.length === 0) {
    return false;
  }

  return fullCats.some((cat: any) => {
    if (!cat) return false;
    if (typeof cat === "object") {
      const title = String(cat.title || cat.name || "").toLowerCase();
      const id = String(cat.id || "").toLowerCase();
      return title === sel || id === sel || title.includes(sel) || sel.includes(title);
    }
    const str = String(cat).toLowerCase();
    return str === sel || str.includes(sel) || sel.includes(str);
  });
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

export function formatExpiryDuration(expiry: any, expiryType?: any): string {
  if (expiry === null || expiry === undefined || expiry === "" || expiry === 0 || expiry === "0") {
    return "Instant";
  }

  const str = String(expiry).trim();
  if (!str || str === "0") return "Instant";

  if (/[a-zA-Z]/.test(str)) {
    return str;
  }

  const num = Number(str);
  if (!Number.isNaN(num) && num > 0) {
    const typeStr = String(expiryType || "").toLowerCase();
    let unit = "Days";
    if (typeStr.includes("hour")) unit = "Hours";
    else if (typeStr.includes("min")) unit = "Mins";
    else if (typeStr.includes("day")) unit = "Days";
    return `${num} ${unit}`;
  }

  return "Instant";
}

export function mapApiOfferToModel(offer: any) {
  const title =
    typeof offer.title === "object"
      ? offer.title?.en || Object.values(offer.title)[0] || ""
      : offer.title || "";

  const osKeys = Object.keys(offer?.strictly_os?.items || {});
  const deviceLabel = osKeys.join(", ");
  const primaryOs = osKeys[0]?.toLowerCase() || "";
  const payoutTotal = offer?.payout?.user_payout ?? "";
  const currency_icon =
    offer.payout?.currency_icon ||
    offer.payments?.find((p: any) => p?.currency_icon)?.currency_icon ||
    "";
  const rawCurrency =
    offer.payout?.currency ||
    offer.payments?.find((p: any) => p?.currency)?.currency ||
    "INR";
  const currencySymbol = getCurrencySymbol(rawCurrency);

  return {
    id: String(offer.id),
    name: title.length > 20 ? `${title.substring(0, 20)}...` : title,
    subtitle: toPlainText(
      offer.description_lang ||
      "Complete It",
    ),
    currency: rawCurrency,
    currency_icon,
    logo: offer.logo,
    earn: `${currency_icon ? "" : currencySymbol}${formatAmount(payoutTotal)}`,
    duration: formatExpiryDuration(offer?.expiry, offer?.expiry_type),
    device: deviceLabel,
    deviceOs: primaryOs,
    category: deriveUiCategory(offer),
    payoutType: offer.is_cpi ? "cpi" : "cpa",
    createdAt: offer.start_at || offer.created_at,
    raw: offer,
  };
}
