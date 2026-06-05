// import modal from "./modal";
// import { sdkState } from "../../core/state/sdkState";

// export function openOfferwall(opts?: { url?: string }) {
//   const url =
//     opts?.url ||
//     (sdkState.config && (sdkState.config as any).offerwallUrl) ||
//     "about:blank";
//   modal.createModal(url);
// }

// export function closeOfferwall() {
//   modal.closeModal();
// }

// export default { openOfferwall, closeOfferwall };

import { createRoot, Root } from "react-dom/client";
import React from "react";
import styles from "../../ui/styles.css?inline";
import { injectCSS } from "../../utils/dom";
import SDKLauncher from "../../ui/SDKLauncher";

injectCSS("growbolt-sdk-styles", styles);

let root: Root | null = null;

export function openOfferwall() {
  let container = document.getElementById("growbolt-root");

  if (!container) {
    container = document.createElement("div");
    container.id = "growbolt-root";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.zIndex = "999999";

    document.body.appendChild(container);
  }
  if (!root) {
    root = createRoot(container);
  }

  root.render(
    React.createElement(SDKLauncher, {
      key: Date.now(),
      onClose: closeOfferwall,
    }),
  );
}

export function closeOfferwall() {
  root?.unmount();
  root = null;

  document.getElementById("growbolt-root")?.remove();
}

export default {
  openOfferwall,
  closeOfferwall,
};
