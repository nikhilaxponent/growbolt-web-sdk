export const ENDPOINTS = {
  SDK_INIT: "/sdk/init",
  SDK_OFFERS: "/api/v1/sdk/offers/",
  SDK_SESSION: "/sdk/session",
  PUBLISHER_CONFIG: "/publisher/config",
  OFFERWALL_DETAILS: "/offerwall/details",
  TRACK_EVENT: "/sdk/event",
  OFFER_REDEEM: "/sdk/offers",
} as const;

export type EndpointType = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
