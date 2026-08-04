import type { SDKService } from '../types/service';
import type { SDKConfig, EventPayload } from '../types/sdk';
import type { GuestBridge, InitPayload } from '../bridge/GuestBridge';

export class PostMessageSDKService implements SDKService {
  private bridge: GuestBridge;
  readonly config: SDKConfig | null;
  readonly sub4: string | null;
  readonly sessionId: string | null;

  constructor(bridge: GuestBridge, init: InitPayload) {
    this.bridge = bridge;
    this.sub4 = init.sub4;
    this.sessionId = init.sessionId;
    this.config = init.config as unknown as SDKConfig | null;
  }

  listOffers(
    options?: Parameters<SDKService['listOffers']>[0],
  ): Promise<unknown[]> {
    return this.bridge.call('listOffers', [options]) as Promise<unknown[]>;
  }

  listCategories(
    options?: Parameters<SDKService['listCategories']>[0],
  ): Promise<unknown[]> {
    return this.bridge.call('listCategories', [options]) as Promise<unknown[]>;
  }

  getOfferDetails(offerId: string): Promise<unknown> {
    return this.bridge.call('getOfferDetails', [offerId]);
  }

  getOngoing(params: Parameters<SDKService['getOngoing']>[0]): Promise<unknown> {
    return this.bridge.call('getOngoing', [params]);
  }

  redeemOffer(offerId: string): Promise<unknown> {
    return this.bridge.call('redeemOffer', [offerId]);
  }

  emit(event: string, payload?: EventPayload): void {
    this.bridge.sendEmit(event, payload);
  }
}
