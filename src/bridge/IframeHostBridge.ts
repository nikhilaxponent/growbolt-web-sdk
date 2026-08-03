import { isGBMessage } from './BridgeProtocol';
import type {
  HostToGuestMessage,
  GuestToHostMessage,
  GBInitMessage,
  GBCallResponseMessage,
  GBCallErrorMessage,
} from './BridgeProtocol';

const CALL_TIMEOUT_MS = 30_000;
const INIT_TIMEOUT_MS = 15_000;

export interface InitPayload {
  sub4: string | null;
  sessionId: string | null;
  config: Record<string, unknown>;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export class IframeHostBridge {
  private lockedOrigin: string | null = null;
  private pending = new Map<string, PendingCall>();
  private listener: ((e: MessageEvent) => void) | null = null;
  private initResolve: ((payload: InitPayload) => void) | null = null;
  private initReject: ((err: Error) => void) | null = null;
  private initTimeout: ReturnType<typeof setTimeout> | null = null;
  private counter = 0;

  constructor() {
    this.listener = this.handleMessage.bind(this);
    window.addEventListener('message', this.listener);
  }

  sendReady(): void {
    // Bootstrap with '*' — we don't know the host origin yet.
    window.parent.postMessage(
      { __gb: '1', type: 'GB_READY' } satisfies GuestToHostMessage,
      '*',
    );
  }

  sendAppReady(): void {
    this.sendToHost({ __gb: '1', type: 'GB_APP_READY' });
  }

  sendClose(): void {
    this.sendToHost({ __gb: '1', type: 'GB_CLOSE' });
  }

  sendEmit(event: string, payload: unknown): void {
    this.sendToHost({ __gb: '1', type: 'GB_EMIT', event, payload });
  }

  waitForInit(): Promise<InitPayload> {
    return new Promise<InitPayload>((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
      this.initTimeout = setTimeout(() => {
        reject(
          new Error(
            `[GrowBolt] GB_INIT not received from host within ${INIT_TIMEOUT_MS / 1000}s.`,
          ),
        );
      }, INIT_TIMEOUT_MS);
    });
  }

  call(method: string, args: unknown[]): Promise<unknown> {
    const requestId = `gb_${++this.counter}_${Date.now()}`;

    return new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId);
        reject(
          new Error(
            `[GrowBolt] Bridge call '${method}' timed out after ${CALL_TIMEOUT_MS / 1000}s.`,
          ),
        );
      }, CALL_TIMEOUT_MS);

      this.pending.set(requestId, { resolve, reject, timeout });
      this.sendToHost({ __gb: '1', type: 'GB_CALL', requestId, method, args });
    });
  }

  private sendToHost(msg: GuestToHostMessage): void {
    const origin = this.lockedOrigin ?? '*';
    window.parent.postMessage(msg, origin);
  }

  private handleMessage(event: MessageEvent): void {
    // Only accept messages from our direct parent.
    if (event.source !== window.parent) return;

    const raw = event.data as unknown;
    if (!isGBMessage(raw)) return;

    const msg = raw as HostToGuestMessage;

    switch (msg.type) {
      case 'GB_INIT': {
        // First host message: lock in the origin for all future validation.
        if (this.lockedOrigin === null) {
          this.lockedOrigin = event.origin;
        }
        if (event.origin !== this.lockedOrigin) return;

        if (this.initTimeout !== null) {
          clearTimeout(this.initTimeout);
          this.initTimeout = null;
        }
        this.initResolve?.((msg as GBInitMessage).payload);
        this.initResolve = null;
        this.initReject = null;
        break;
      }

      case 'GB_CALL_RESPONSE': {
        if (this.lockedOrigin !== null && event.origin !== this.lockedOrigin) return;
        const responseMsg = msg as GBCallResponseMessage;
        const pending = this.pending.get(responseMsg.requestId);
        if (pending !== undefined) {
          clearTimeout(pending.timeout);
          this.pending.delete(responseMsg.requestId);
          pending.resolve(responseMsg.result);
        }
        break;
      }

      case 'GB_CALL_ERROR': {
        if (this.lockedOrigin !== null && event.origin !== this.lockedOrigin) return;
        const errorMsg = msg as GBCallErrorMessage;
        const pending = this.pending.get(errorMsg.requestId);
        if (pending !== undefined) {
          clearTimeout(pending.timeout);
          this.pending.delete(errorMsg.requestId);
          pending.reject(new Error(errorMsg.error));
        }
        break;
      }

      default:
        break;
    }
  }

  destroy(): void {
    if (this.listener !== null) {
      window.removeEventListener('message', this.listener);
      this.listener = null;
    }
    if (this.initTimeout !== null) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('[GrowBolt] Bridge destroyed.'));
    }
    this.pending.clear();
  }
}
