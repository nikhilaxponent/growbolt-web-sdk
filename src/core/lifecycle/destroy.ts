import { emitter } from "../events/emitter";
import { sdkState, resetSdkState } from "../state/sdkState";
import { sessionState, resetSessionState } from "../state/sessionState";
import modal from "../../modules/widget/modal";
import { logger } from "../../services/logger/logger";
import sessionService from "../../services/session/session";

export async function destroy() {
  try {
    logger.info("SDK Destroying");

    // close modal if open
    if (sdkState.widgetOpen) {
      modal.closeModal();
    }

    // clear session
    sessionService.clearSession();

    // reset all state
    resetSdkState();
    resetSessionState();

    // emit destroyed event
    emitter.emit("sdk_destroyed");

    logger.info("SDK Destroyed");
    return { ok: true };
  } catch (err) {
    logger.error("SDK destroy error", err);
    return { ok: false };
  }
}
