import modal from "./modal";
import { sdkState } from "../../core/state/sdkState";

export function openOfferwall(opts?: { url?: string }) {
  const url =
    opts?.url ||
    (sdkState.config && (sdkState.config as any).offerwallUrl) ||
    "about:blank";
  modal.createModal(url);
}

export function closeOfferwall() {
  modal.closeModal();
}

export default { openOfferwall, closeOfferwall };
