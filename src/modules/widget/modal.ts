import { emitter } from "../../core/events/emitter";
import { sdkState } from "../../core/state/sdkState";

const MODAL_ID = "growbolt-offerwall-modal";

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
  container.style.width = "900px";
  container.style.height = "600px";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  container.style.background = "#fff";

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";

  container.appendChild(iframe);
  overlay.appendChild(container);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  sdkState.widgetOpen = true;
  emitter.emit("widget_opened", { url });
}

export function closeModal() {
  const el = document.getElementById(MODAL_ID);
  if (!el) return;
  el.remove();
  sdkState.widgetOpen = false;
  emitter.emit("widget_closed");
}

export function isModalOpen() {
  return !!document.getElementById(MODAL_ID);
}

export default { createModal, closeModal, isModalOpen };
