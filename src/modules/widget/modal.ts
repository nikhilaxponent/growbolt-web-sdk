/* eslint-disable @typescript-eslint/no-explicit-any */
import { emitter } from "../../core/events/emitter";
import { sdkState } from "../../core/state/sdkState";
import { sessionState } from "../../core/state/sessionState";
import { logger } from "../../services/logger/logger";

const MODAL_ID = "growbolt-offerwall-modal";

type HandshakeMsg = {
  type: string;
  sdkVersion?: string;
  nonce?: string;
  payload?: any;
};

let globalMessageListener: ((e: MessageEvent) => void) | null = null;
let handshakeTimeoutRef: number | null = null;
let iframeOriginRef: string | null = null;
let currentIframeWindow: Window | null = null;

export function createModal(url: string) {
  // prevent duplicate
  if (document.getElementById(MODAL_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = MODAL_ID;
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const container = document.createElement("div");
  // responsive sizing: desktop fixed, mobile full-bleed
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );
  if (vw < 900) {
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.borderRadius = "0";
  } else {
    container.style.width = "900px";
    container.style.height = "600px";
    container.style.borderRadius = "8px";
  }
  container.style.overflow = "hidden";
  container.style.background = "#fff";
  container.style.maxWidth = "100%";
  container.style.maxHeight = "100%";

  // append session and publisher identifiers as non-secret query params
  try {
    const u = new URL(url);
    if (sessionState.sessionId)
      u.searchParams.set("gb_session", sessionState.sessionId);
    if ((sdkState.config as any)?.publisherId)
      u.searchParams.set("gb_publisher", (sdkState.config as any).publisherId);
    url = u.toString();
  } catch (err) {
    // ignore malformed urls
    logger.debug("createModal: invalid url, skipping session append", err);
  }

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("loading", "lazy");
  // sandbox for safety: allow scripts and forms; disallow top-navigation
  iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-popups");
  iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");

  container.appendChild(iframe);
  overlay.appendChild(container);

  // click-outside closes modal
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  sdkState.widgetOpen = true;
  emitter.emit("widget_opened", { url });

  // secure postMessage handshake
  try {
    iframeOriginRef = new URL(url).origin;
  } catch (e) {
    // invalid URL: do not accept any postMessage for safety
    iframeOriginRef = null;
    logger.error("createModal: invalid iframe URL, cannot determine origin", e);
  }

  currentIframeWindow = iframe.contentWindow || null;

  function cleanupListener() {
    if (globalMessageListener) {
      window.removeEventListener("message", globalMessageListener);
      globalMessageListener = null;
    }
    if (handshakeTimeoutRef) {
      window.clearTimeout(handshakeTimeoutRef);
      handshakeTimeoutRef = null;
    }
    iframeOriginRef = null;
    currentIframeWindow = null;
  }

  globalMessageListener = (e: MessageEvent) => {
    // require known origin
    if (!iframeOriginRef) return;
    if (e.origin !== iframeOriginRef) return;
    if (e.source !== currentIframeWindow) return;
    const data: HandshakeMsg =
      typeof e.data === "object" ? e.data : ({} as any);
    if (!data || !data.type) return;

    if (data.type === "handshake") {
      // reply with ack and sdk-provided session info
      const ack = {
        type: "handshake_ack",
        nonce: data.nonce || null,
        payload: { sessionId: sessionState.sessionId || null },
      };
      try {
        currentIframeWindow?.postMessage(ack, iframeOriginRef as string);
      } catch (err) {
        logger.error("Failed to post handshake ack to iframe", err);
        // ignore
      }
      cleanupListener();
      emitter.emit("iframe_loaded", { url, sessionId: sessionState.sessionId });
    } else if (data.type === "iframe_error") {
      cleanupListener();
      emitter.emit("iframe_error", { url, info: data.payload });
      showFallback(container, url);
    } else if (data.type === "offer_click") {
      // surface offer click event to publishers
      emitter.emit("offer_click", { payload: data.payload });
    }
  };

  window.addEventListener("message", globalMessageListener);

  // handshake timeout: if no handshake within 15s, treat as error
  handshakeTimeoutRef = window.setTimeout(() => {
    emitter.emit("iframe_error", { url, reason: "handshake_timeout" });
    showFallback(container, url);
    cleanupListener();
  }, 15000) as unknown as number;

  // also listen for iframe load errors
  iframe.addEventListener("error", () => {
    emitter.emit("iframe_error", { url, reason: "load_error" });
    cleanupListener();
    showFallback(container, url);
  });
}

function showFallback(container: HTMLDivElement, originalUrl: string) {
  // clear existing children
  container.innerHTML = "";
  const fallback = document.createElement("div");
  fallback.style.display = "flex";
  fallback.style.flexDirection = "column";
  fallback.style.alignItems = "center";
  fallback.style.justifyContent = "center";
  fallback.style.padding = "20px";
  fallback.style.height = "100%";

  const title = document.createElement("div");
  title.textContent = "Offerwall failed to load";
  title.style.fontSize = "18px";
  title.style.marginBottom = "8px";
  fallback.appendChild(title);

  const detail = document.createElement("div");
  detail.textContent = "Please try again or close this window.";
  detail.style.fontSize = "13px";
  detail.style.color = "#666";
  detail.style.marginBottom = "16px";
  fallback.appendChild(detail);

  const btns = document.createElement("div");
  btns.style.display = "flex";
  btns.style.gap = "8px";

  const retry = document.createElement("button");
  retry.textContent = "Retry";
  retry.onclick = () => {
    // recreate iframe by reusing createModal: remove modal and open again
    // find overlay parent
    const overlay = document.getElementById(MODAL_ID);
    if (!overlay) return;
    overlay.remove();
    // reopen
    createModal(originalUrl);
  };

  const close = document.createElement("button");
  close.textContent = "Close";
  close.onclick = () => {
    closeModal();
  };

  btns.appendChild(retry);
  btns.appendChild(close);
  fallback.appendChild(btns);

  container.appendChild(fallback);
}

export function closeModal() {
  const el = document.getElementById(MODAL_ID);
  if (!el) return;
  // cleanup global listener if exists
  if (globalMessageListener) {
    window.removeEventListener("message", globalMessageListener);
    globalMessageListener = null;
  }
  // clear handshake timeout and refs
  if (handshakeTimeoutRef) {
    window.clearTimeout(handshakeTimeoutRef);
    handshakeTimeoutRef = null;
  }
  iframeOriginRef = null;
  currentIframeWindow = null;
  el.remove();
  sdkState.widgetOpen = false;
  emitter.emit("widget_closed");
}

export function isModalOpen() {
  return !!document.getElementById(MODAL_ID);
}

export default { createModal, closeModal, isModalOpen };
