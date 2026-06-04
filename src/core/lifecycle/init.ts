/* eslint-disable @typescript-eslint/no-explicit-any */
import { emitter } from "../events/emitter";
import { sdkState } from "../state/sdkState";
import ApiClient from "../../services/api/apiClient";
import sessionService from "../../services/session/session";
import { logger } from "../../services/logger/logger";
import { validateConfig } from "../../utils/validate";
import { ENDPOINTS } from "../../services/api/endpoints";
import { resolveApiBaseUrl } from "../../config/runtime";
import { getSdkAuthHeaders } from "../api/auth";
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

    const resolvedBase = resolveApiBaseUrl(config.baseUrl);
    sdkState.config = {
      ...config,
      apiKey: config.apiKey,
      baseUrl: resolvedBase,
    } as SDKConfig;

    // restore or create session
    const restored = sessionService.restoreSession();
    const session = restored || sessionService.createSession();
    logger.debug("Session:", session.sessionId);

    const api = new ApiClient({
      baseUrl: resolvedBase,
    });
    // expose api client on sdkState for later SDK methods
    (sdkState as any).apiClient = api;

    // Prefer calling offers endpoint which both verifies the apiKey and returns offers+publisherConfig
    let resp: any = null;
    try {
      logger.debug("Calling backend offers", ENDPOINTS.SDK_OFFERS);
      resp = await api.get(ENDPOINTS.SDK_OFFERS, {
        headers: getSdkAuthHeaders(),
      } as any);
      logger.debug("Offers endpoint response successfully received");
    } catch (err) {
      logger.warn("Offers endpoint failed, falling back to SDK_INIT", err);
      // fallback to existing init path
      try {
        logger.debug(`Calling backend init ${ENDPOINTS.SDK_INIT}`);
        resp = await api.post(ENDPOINTS.SDK_INIT, {
          apiKey: config.apiKey,
          sessionId: session.sessionId,
        });
        logger.debug("Backend init response:", resp);
      } catch (err2) {
        logger.warn("Backend initialization failed, continuing offline", err2);
        resp = null;
      }
    }

    if (resp && resp.publisherConfig) {
      sdkState.publisherConfig = resp.publisherConfig;
      logger.debug("Publisher config loaded:", resp.publisherConfig);
    }

    // If backend provides offers or an offers endpoint is available, try to fetch offers
    try {
      // prefer explicit offers returned by SDK_INIT
      if (resp && resp.offers) {
        sdkState.offers = resp.offers;

        logger.debug("Offers loaded, count:", resp.offers.length);

        logger.debug(
          "Offers loaded from init response, count:",
          resp.offers.length,
        );
      } else if (resolvedBase) {
        // attempt to fetch offers from a well-known path
        try {
          const offersPath = "/api/v1/sdk/offers/";
          logger.debug(`Fetching offers from ${offersPath}`);
          // send api key in header (do not expose in query string)
          const offersResp: any = await api.get(offersPath, {
            headers: getSdkAuthHeaders(),
          } as any);
          if (offersResp && Array.isArray(offersResp.offers)) {
            sdkState.offers = offersResp.offers;
            logger.debug(
              "Offers loaded from offers endpoint, count:",
              offersResp.offers.length,
            );
          } else if (Array.isArray(offersResp)) {
            sdkState.offers = offersResp;
            logger.debug(
              "Offers loaded from offers endpoint (array response), count:",
              offersResp.length,
            );
          }
        } catch (e) {
          logger.warn(
            "Failed to fetch offers endpoint, continuing without offers",
            e,
          );
        }
      }
    } catch (e) {
      logger.warn("Offers processing failed", e);
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
      offers: sdkState.offers || [],
    };
  } catch (err) {
    logger.error("init error", err);
    throw err;
  }
}
