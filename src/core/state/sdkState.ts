export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  [key: string]: any;
}

export const sdkState: {
  initialized: boolean;
  config: SDKConfig | null;
  widgetOpen: boolean;
  publisherConfig: any | null;
} = {
  initialized: false,
  config: null,
  widgetOpen: false,
  publisherConfig: null,
};

export function resetSdkState() {
  sdkState.initialized = false;
  sdkState.config = null;
  sdkState.widgetOpen = false;
  sdkState.publisherConfig = null;
}
