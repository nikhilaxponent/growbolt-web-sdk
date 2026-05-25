export const ENDPOINTS = {
  SDK_INIT: "/sdk/init",
  SDK_SESSION: "/sdk/session",
  PUBLISHER_CONFIG: "/publisher/config",
} as const;

export type EndpointType = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
