export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  sub4?: string;
  [key: string]: any;
}

export interface SDKUser {
  sub4?: string;
  [key: string]: any;
}

export const sdkState: {
  initialized: boolean;
  config: SDKConfig | null;
  widgetOpen: boolean;
  publisherConfig: any | null;
  offers: any[] | null;
  apiClient?: any;
  user: SDKUser | null;
} = {
  initialized: false,
  config: null,
  widgetOpen: false,
  publisherConfig: null,
  offers: null,
  user: null,
};

export function resetSdkState() {
  sdkState.initialized = false;
  sdkState.config = null;
  sdkState.widgetOpen = false;
  sdkState.publisherConfig = null;
  sdkState.offers = null;
  sdkState.apiClient = undefined;
  sdkState.user = null;
}

