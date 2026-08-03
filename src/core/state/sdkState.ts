/* eslint-disable @typescript-eslint/no-explicit-any */
import type ApiClient from '../../services/api/apiClient';

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
  publisherConfig: any;
  offers: any[] | null;
  apiClient: ApiClient | undefined;
  user: SDKUser | null;
} = {
  initialized: false,
  config: null,
  widgetOpen: false,
  publisherConfig: null,
  offers: null,
  apiClient: undefined,
  user: null,
};

export function resetSdkState(): void {
  sdkState.initialized = false;
  sdkState.config = null;
  sdkState.widgetOpen = false;
  sdkState.publisherConfig = null;
  sdkState.offers = null;
  sdkState.apiClient = undefined;
  sdkState.user = null;
}
