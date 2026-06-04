/* eslint-disable @typescript-eslint/no-explicit-any */
import DOMPurify from "dompurify";

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;
const ENCODED_HTML_REGEX = /&lt;\/?[a-z]|&#x3c;\/?[a-z]|&#60;\/?[a-z]/i;

export type SanitizedContent = {
  content: string;
  isHtml: boolean;
};

/** Pull a display string from API locale objects or primitives. */
export const extractText = (value: any): string => {
  if (value == null) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    const fromEn = value.en;
    if (typeof fromEn === "string" && fromEn.trim()) return fromEn.trim();
    const first = Object.values(value).find(
      (v) => typeof v === "string" && (v as string).trim(),
    );
    return typeof first === "string" ? first.trim() : "";
  }

  return String(value).trim();
};

function decodeHtmlEntities(input: string): string {
  if (!input) return "";

  if (typeof document !== "undefined") {
    const el = document.createElement("textarea");
    el.innerHTML = input;
    return el.value;
  }

  return input
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function decodeRepeatedly(input: string, maxPasses = 4): string {
  let current = input;
  for (let i = 0; i < maxPasses; i++) {
    const next = decodeHtmlEntities(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

function containsHtmlMarkup(input: string): boolean {
  return HTML_TAG_REGEX.test(input) || ENCODED_HTML_REGEX.test(input);
}

function toRenderableHtml(raw: string): string {
  const decoded = decodeRepeatedly(raw);
  if (HTML_TAG_REGEX.test(decoded)) {
    return decoded;
  }
  if (ENCODED_HTML_REGEX.test(raw)) {
    return decodeRepeatedly(raw);
  }
  return decoded;
}

/**
 * Normalize API content for safe rendering.
 * Plain text → unchanged. HTML / encoded / double-encoded → sanitized HTML.
 */
export const sanitizeContent = (value: any): SanitizedContent => {
  const text = extractText(value);

  if (!text) {
    return { content: "", isHtml: false };
  }

  if (!containsHtmlMarkup(text)) {
    return { content: text, isHtml: false };
  }

  const html = toRenderableHtml(text);
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  const hasTags = Boolean(sanitized && HTML_TAG_REGEX.test(sanitized));
  if (!hasTags) {
    return { content: sanitized || text, isHtml: false };
  }

  return { content: sanitized, isHtml: true };
};

/** Plain-text only (search, labels) — strips tags and entities. */
export const toPlainText = (value: any): string => {
  const { content, isHtml } = sanitizeContent(value);
  if (!content) return "";
  if (!isHtml) return content;
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = content;
    return (el.textContent || el.innerText || "").trim();
  }
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};
