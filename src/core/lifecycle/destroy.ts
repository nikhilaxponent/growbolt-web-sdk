import { emitter } from "../events/emitter";
import { resetSdkState } from "../state/sdkState";
import { resetSessionState } from "../state/sessionState";
import { destroyWidget } from "../../modules/widget/widget";
import { logger } from "../../services/logger/logger";
import sessionService from "../../services/session/session";

export async function destroy() {
  try {
    logger.info("SDK Destroying");

    destroyWidget();

    // clear session
    sessionService.clearSession();

    // reset all state
    resetSdkState();
    resetSessionState();

    // emit destroyed event
    emitter.emit("sdk_destroyed");
    // clear all listeners to avoid leaks across init/destroy cycles
    // (keep this after emit so listeners for sdk_destroyed still run)
    // @ts-ignore - removeAllListeners exists on emitter
    (emitter as any).removeAllListeners();

    logger.info("SDK Destroyed");
    return { ok: true };
  } catch (err) {
    logger.error("SDK destroy error", err);
    return { ok: false };
  }
}
