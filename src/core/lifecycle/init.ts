import { emitter } from "../events/emitter";
import { sdkState } from "../state/sdkState";
import ApiClient from "../../services/api/apiClient";
import sessionService from "../../services/session/session";
import { logger } from "../../services/logger/logger";
import { validateConfig } from "../../utils/validate";
import { ENDPOINTS } from "../../services/api/endpoints";
import type { InitResponse, SDKConfig } from "../../types/sdk";

export async function init(config?: Partial<SDKConfig>): Promise<InitResponse> {
  const validation = validateConfig(config || {});
  if (!validation.valid) {
    logger.error("init validation failed:", validation.errors.join(", "));
    throw new Error(`GrowBolt.init: ${validation.errors[0]}`);
  }

  if (!config || !config.apiKey) {
    throw new Error("GrowBolt.init: apiKey is required");
  }

  try {
    logger.info("SDK initializing");
    sdkState.config = config as any;

    // restore or create session
    const restored = sessionService.restoreSession();
    const session = restored || sessionService.createSession();
    logger.debug("Session:", session.sessionId);

    // create api client
    const api = new ApiClient({
      baseUrl: config.baseUrl,
    });

    // call backend to initialize SDK (backend validates apiKey and returns publisher config)
    let resp: any = null;
    try {
      logger.debug(`Calling backend ${ENDPOINTS.SDK_INIT}`);
      resp = await api.post(ENDPOINTS.SDK_INIT, {
        apiKey: config.apiKey,
        sessionId: session.sessionId,
      });
      logger.debug("Backend response:", resp);
    } catch (err) {
      // log and continue — SDK should still be usable locally
      logger.warn("Backend initialization failed, continuing offline", err);
      resp = null;
    }

    if (resp && resp.publisherConfig) {
      sdkState.publisherConfig = resp.publisherConfig;
      logger.debug("Publisher config loaded:", resp.publisherConfig);
    }

    sdkState.initialized = true;

    emitter.emit("sdk_initialized", {
      session: session,
      publisherConfig: sdkState.publisherConfig,
    });

    logger.info("SDK initialized successfully");
    return {
      ok: true,
      session,
      publisherConfig: sdkState.publisherConfig,
    };
  } catch (err) {
    logger.error("init error", err);
    throw err;
  }
}
