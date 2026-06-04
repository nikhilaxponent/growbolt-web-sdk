import { sdkState } from "../state/sdkState";

/** Authorization header built from the single init() configuration. */
export function getSdkAuthHeaders(): Record<string, string> {
  const config = sdkState.config;
  if (!config?.apiKey) {
    throw new Error("GrowBolt SDK not initialized — call GrowBolt.init({ apiKey }) first");
  }
  const scheme = (config as { apiKeyScheme?: string }).apiKeyScheme || "SdkToken";
  return {
    Authorization: `${scheme} ${String(config.apiKey)}`,
  };
}

export function assertInitialized(): void {
  if (!sdkState.initialized || !sdkState.config?.apiKey) {
    throw new Error("GrowBolt SDK not initialized — call GrowBolt.init({ apiKey }) first");
  }
}
