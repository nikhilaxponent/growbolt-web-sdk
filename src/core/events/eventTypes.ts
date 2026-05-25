export const EVENTS = {
  SDK_INITIALIZED: "sdk_initialized",
  SDK_DESTROYED: "sdk_destroyed",
  WIDGET_OPENED: "widget_opened",
  WIDGET_CLOSED: "widget_closed",
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
