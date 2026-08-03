import type { SDKService } from '../types/service';

export type ResolveTrackedOfferUrlParams = {
  offerId: string;
  title: string;
  fallbackUrl?: string;
  fallbackPreviewUrl?: string;
};

function buildAttributedUrl(rawUrl: string, sdk: SDKService): string {
  if (!rawUrl) return '';
  try {
    const u = new URL(rawUrl);
    const config = sdk.config;
    const sub4 =
      sdk.sub4 ||
      config?.sub4 ||
      (config as Record<string, unknown>)?.userId as string | undefined ||
      sdk.sessionId ||
      '';
    if (sub4) {
      u.searchParams.set('sub4', sub4);
      u.searchParams.set('subid4', sub4);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

export async function resolveTrackedOfferUrl(
  params: ResolveTrackedOfferUrlParams,
  sdk: SDKService,
): Promise<string | null> {
  let redeemResponse: Record<string, unknown> | null = null;
  try {
    redeemResponse = (await sdk.redeemOffer(String(params.offerId))) as Record<string, unknown>;
  } catch (err) {
    console.warn('redeemOffer API failed, falling back to static URL', err);
  }

  const targetUrl =
    (redeemResponse?.url as string | undefined) ||
    (redeemResponse?.click_url as string | undefined) ||
    params.fallbackUrl ||
    params.fallbackPreviewUrl ||
    '';

  if (!targetUrl) return null;

  const attributedUrl = buildAttributedUrl(targetUrl, sdk);

  sdk.emit('offer_click', {
    offerId: params.offerId,
    title: params.title,
    url: attributedUrl,
  });

  return attributedUrl;
}
