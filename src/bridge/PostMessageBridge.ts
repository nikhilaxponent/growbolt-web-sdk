import { isGBMessage } from './BridgeProtocol';
import type {
  GuestToHostMessage,
  HostToGuestMessage,
  GBCallMessage,
  GBEmitMessage,
} from './BridgeProtocol';
import type { SDKService } from '../types/service';

const READY_TIMEOUT_MS = 15_000;

export interface PostMessageBridgeCallbacks {
  onReady: () => void;
  onAppReady: () => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export class PostMessageBridge {
  private iframe: HTMLIFrameElement;
  private allowedOrigin: string;
  private service: SDKService;
  private callbacks: PostMessageBridgeCallbacks;
  private readyTimeout: ReturnType<typeof setTimeout> | null = null;
  private listener: ((e: MessageEvent) => void) | null = null;

  constructor(
    iframe: HTMLIFrameElement,
    allowedOrigin: string,
    service: SDKService,
    callbacks: PostMessageBridgeCallbacks,
  ) {
    this.iframe = iframe;
    this.allowedOrigin = allowedOrigin;
    this.service = service;
    this.callbacks = callbacks;

    this.listener = this.handleMessage.bind(this);
    window.addEventListener('message', this.listener);

    this.readyTimeout = setTimeout(() => {
      callbacks.onError(
        `[GrowBolt] Offerwall iframe did not send GB_READY within ${READY_TIMEOUT_MS / 1000}s.`,
      );
    }, READY_TIMEOUT_MS);
  }

  sendInit(payload: {
    sub4: string | null;
    sessionId: string | null;
    config: Record<string, unknown>;
  }): void {
    this.postToIframe({ __gb: '1', type: 'GB_INIT', payload });
  }

  private postToIframe(msg: HostToGuestMessage): void {
    this.iframe.contentWindow?.postMessage(msg, this.allowedOrigin);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.source !== this.iframe.contentWindow) return;
    if (event.origin !== this.allowedOrigin) return;

    const raw = event.data as unknown;
    if (!isGBMessage(raw)) return;

    const msg = raw as GuestToHostMessage;

    switch (msg.type) {
      case 'GB_READY': {
        if (this.readyTimeout !== null) {
          clearTimeout(this.readyTimeout);
          this.readyTimeout = null;
        }
        this.callbacks.onReady();
        break;
      }

      case 'GB_APP_READY': {
        this.callbacks.onAppReady();
        break;
      }

      case 'GB_CLOSE': {
        this.callbacks.onClose();
        break;
      }

      case 'GB_EMIT': {
        const emitMsg = msg as GBEmitMessage;
        this.service.emit(
          emitMsg.event,
          emitMsg.payload as Record<string, unknown>,
        );
        break;
      }

      case 'GB_CALL': {
        const callMsg = msg as GBCallMessage;
        try {
          const result = await this.dispatch(callMsg.method, callMsg.args);
          this.postToIframe({
            __gb: '1',
            type: 'GB_CALL_RESPONSE',
            requestId: callMsg.requestId,
            ok: true,
            result,
          });
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          this.postToIframe({
            __gb: '1',
            type: 'GB_CALL_ERROR',
            requestId: callMsg.requestId,
            ok: false,
            error,
          });
        }
        break;
      }

      default:
        break;
    }
  }

  private dispatch(method: string, args: unknown[]): Promise<unknown> {
    switch (method) {
      case 'listOffers':
        return this.service.listOffers(
          args[0] as Parameters<SDKService['listOffers']>[0],
        );
      case 'listCategories':
        return this.service.listCategories(
          args[0] as Parameters<SDKService['listCategories']>[0],
        );
      case 'getOfferDetails':
        return this.service.getOfferDetails(args[0] as string);
      case 'getOngoing':
        return this.service.getOngoing(
          args[0] as Parameters<SDKService['getOngoing']>[0],
        );
      case 'redeemOffer':
        return this.service.redeemOffer(args[0] as string);
      default:
        return Promise.reject(
          new Error(`[GrowBolt] Unknown bridge method: "${method}"`),
        );
    }
  }

  destroy(): void {
    if (this.listener !== null) {
      window.removeEventListener('message', this.listener);
      this.listener = null;
    }
    if (this.readyTimeout !== null) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
  }
}
