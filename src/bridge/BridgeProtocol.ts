export const GB_PROTOCOL_VERSION = '1' as const;

// ── Host → Guest ────────────────────────────────────────────────────────────

export interface GBInitMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_INIT';
  payload: {
    sub4: string | null;
    sessionId: string | null;
    config: Record<string, unknown>;
  };
}

export interface GBCallResponseMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_CALL_RESPONSE';
  requestId: string;
  ok: true;
  result: unknown;
}

export interface GBCallErrorMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_CALL_ERROR';
  requestId: string;
  ok: false;
  error: string;
}

export type HostToGuestMessage =
  | GBInitMessage
  | GBCallResponseMessage
  | GBCallErrorMessage;

// ── Guest → Host ────────────────────────────────────────────────────────────

export interface GBReadyMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_READY';
}

export interface GBAppReadyMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_APP_READY';
}

export interface GBCallMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_CALL';
  requestId: string;
  method: string;
  args: unknown[];
}

export interface GBEmitMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_EMIT';
  event: string;
  payload: unknown;
}

export interface GBCloseMessage {
  __gb: typeof GB_PROTOCOL_VERSION;
  type: 'GB_CLOSE';
}

export type GuestToHostMessage =
  | GBReadyMessage
  | GBAppReadyMessage
  | GBCallMessage
  | GBEmitMessage
  | GBCloseMessage;

export type BridgeMessage = HostToGuestMessage | GuestToHostMessage;

export function isGBMessage(msg: unknown): msg is BridgeMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    '__gb' in msg &&
    (msg as Record<string, unknown>).__gb === GB_PROTOCOL_VERSION
  );
}
