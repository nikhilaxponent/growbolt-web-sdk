export type ResolveTrackedOfferUrlParams = {
  offerId: string;
  title: string;
  fallbackUrl?: string;
  fallbackPreviewUrl?: string;
};

function buildAttributedUrl(rawUrl: string): string {
  if (!rawUrl) return "";

  try {
    const u = new URL(rawUrl);
    const config = window.GrowBolt?.config;
    const sub4 =
      config?.sub4 || config?.userId || window.GrowBolt?.sessionId || "";

    if (sub4) {
      u.searchParams.set("sub4", sub4);
      u.searchParams.set("subid4", sub4);
    }

    return u.toString();
  } catch {
    return rawUrl;
  }
}

export async function resolveTrackedOfferUrl(
  params: ResolveTrackedOfferUrlParams,
): Promise<string | null> {
  if (!window.GrowBolt?.redeemOffer) {
    console.error("redeemOffer method not found on GrowBolt");
    return null;
  }

  const redeemResponse = await window.GrowBolt.redeemOffer(
    String(params.offerId),
  );

  const targetUrl =
    redeemResponse?.url ||
    redeemResponse?.click_url ||
    params.fallbackUrl ||
    params.fallbackPreviewUrl ||
    "";

  if (!targetUrl) {
    return null;
  }

  const attributedUrl = buildAttributedUrl(targetUrl);

  window.GrowBolt?.emit("offer_click", {
    offerId: params.offerId,
    title: params.title,
    url: attributedUrl,
  });

  return attributedUrl;
}
