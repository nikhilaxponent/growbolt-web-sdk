import type {
  GuestToHostMessage,
  HostToGuestMessage,
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

export interface GuestBridge {
  sendReady(): void;
  sendAppReady(): void;
  sendClose(): void;
  sendEmit(event: string, payload: unknown): void;
  waitForInit(): Promise<InitPayload>;
  call(method: string, args: unknown[]): Promise<unknown>;
  destroy(): void;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Shared protocol logic — subclasses only implement transport.
export abstract class BaseGuestBridge implements GuestBridge {
  private pending = new Map<string, PendingCall>();
  private initResolve: ((payload: InitPayload) => void) | null = null;
  private initReject: ((err: Error) => void) | null = null;
  private initTimeout: ReturnType<typeof setTimeout> | null = null;
  private counter = 0;

  protected abstract sendRaw(msg: GuestToHostMessage): void;

  sendReady(): void {
    this.sendRaw({ __gb: '1', type: 'GB_READY' });
  }

  sendAppReady(): void {
    this.sendRaw({ __gb: '1', type: 'GB_APP_READY' });
  }

  sendClose(): void {
    this.sendRaw({ __gb: '1', type: 'GB_CLOSE' });
  }

  sendEmit(event: string, payload: unknown): void {
    this.sendRaw({ __gb: '1', type: 'GB_EMIT', event, payload });
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
      this.sendRaw({ __gb: '1', type: 'GB_CALL', requestId, method, args });
    });
  }

  protected handleIncoming(msg: HostToGuestMessage): void {
    switch (msg.type) {
      case 'GB_INIT': {
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
        const res = msg as GBCallResponseMessage;
        const p = this.pending.get(res.requestId);
        if (p !== undefined) {
          clearTimeout(p.timeout);
          this.pending.delete(res.requestId);
          p.resolve(res.result);
        }
        break;
      }
      case 'GB_CALL_ERROR': {
        const err = msg as GBCallErrorMessage;
        const p = this.pending.get(err.requestId);
        if (p !== undefined) {
          clearTimeout(p.timeout);
          this.pending.delete(err.requestId);
          p.reject(new Error(err.error));
        }
        break;
      }
      default:
        break;
    }
  }

  protected destroyBase(): void {
    if (this.initTimeout !== null) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    this.initReject?.(new Error('[GrowBolt] Bridge destroyed.'));
    this.initResolve = null;
    this.initReject = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timeout);
      p.reject(new Error('[GrowBolt] Bridge destroyed.'));
    }
    this.pending.clear();
  }

  abstract destroy(): void;
}
