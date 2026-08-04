import { isGBMessage } from './BridgeProtocol';
import type { GuestToHostMessage, HostToGuestMessage } from './BridgeProtocol';
import { BaseGuestBridge } from './GuestBridge';

// Guest-side bridge for iframe environments: communicates with the host page
// via window.parent.postMessage. Locks the trusted origin on first GB_INIT.
export class PostMessageGuestBridge extends BaseGuestBridge {
  private lockedOrigin: string | null = null;
  private listener: ((e: MessageEvent) => void) | null = null;

  constructor() {
    super();
    this.listener = this.handleMessage.bind(this);
    window.addEventListener('message', this.listener);
  }

  protected sendRaw(msg: GuestToHostMessage): void {
    // Use '*' until GB_INIT locks in the parent's origin.
    window.parent.postMessage(msg, this.lockedOrigin ?? '*');
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== window.parent) return;

    const raw = event.data as unknown;
    if (!isGBMessage(raw)) return;

    const msg = raw as HostToGuestMessage;

    if (msg.type === 'GB_INIT') {
      if (this.lockedOrigin === null) {
        this.lockedOrigin = event.origin;
      }
    }
    if (this.lockedOrigin !== null && event.origin !== this.lockedOrigin) return;

    this.handleIncoming(msg);
  }

  destroy(): void {
    if (this.listener !== null) {
      window.removeEventListener('message', this.listener);
      this.listener = null;
    }
    this.destroyBase();
  }
}
