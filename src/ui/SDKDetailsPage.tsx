/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useState, useEffect } from "react";
import { toPlainText } from "../utils/sanitizeContent";
import { resolveTrackedOfferUrl } from "../utils/offerClick";
import { useSDK } from "./hooks/useSDK";
import { useOfferClaim } from "./hooks/useOfferClaim";
import PaymentMilestoneCard from "./components/PaymentMilestoneCard";
import ClaimLinkModal from "./components/ClaimLinkModal";
import noteIcon from "./assets/note.svg";
import disclaimerIcon from "./assets/disclaimer.svg";
import completedIcon from "./assets/completed.svg";
import progressIcon from "./assets/progress.svg";
import lockedIcon from "./assets/locked.svg";
import RichContent from "./components/RichContent";
import { formatAmount, formatExpiryDuration } from "./mapOffer";
const Modal = React.lazy(() => import("./Modal"));
const BannerSection = React.lazy(() => import("./components/BannerSection"));
const OfferHeaderCard = React.lazy(
  () => import("./components/OfferHeaderCard"),
);
const StickyCTA = React.lazy(() => import("./components/StickyCTA"));

type Props = {
  open: boolean;
  offerId: string | null;
  fallbackOffer?: {
    id: string;
    name: string;
    subtitle?: string;
    logo?: string;
    earn?: string;
    preview_url?: string;
    url?: string;
    currency?: string;
    device?: string;
    deviceOs?: string;
    duration?: string;
  } | null;
  onClose?: () => void;
  onBack?: () => void;
};

export default function SDKDetailsPage({
  open,
  offerId,
  fallbackOffer,
  onClose,
  onBack,
}: Props) {
  const sdk = useSDK();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { claimModalOpen, claimUrl, openClaim, closeClaim } = useOfferClaim();

  useEffect(() => {
    if (!open || !offerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetails(null);
      setError(null);
      return;
    }

    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await sdk.getOfferDetails(offerId!);
        if (active) {
          setDetails(res);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          console.error("Failed to load offer details", err);
          setError(err.message || "Failed to load offer details");
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [open, offerId, sdk]);

  const isValidIcon = (url: string | undefined | null) => {
    if (!url) return false;
    const cleaned = url.trim().toLowerCase();
    return cleaned !== "" && cleaned !== "null" && cleaned !== "undefined" && cleaned !== "none";
  };

  const formatAmount = (value: string | number | undefined) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? num.toString() : num.toFixed(3);
  };

  const totalReward =
    details?.payments?.reduce(
      (sum: number, payment: any) => sum + Number(payment.user_payout || 0),
      0,
    ) || 0;

  const title =
    toPlainText(details?.title) || fallbackOffer?.name || "Offer Details";
  const subtitle = details?.description_lang || details?.description || fallbackOffer?.subtitle || "";
  const logo =
    details?.logo || details?.logo_source || fallbackOffer?.logo || "";
  const bannerImage = (() => {
    const creatives = details?.creatives;
    if (Array.isArray(creatives) && creatives.length > 0) {
      return creatives[0]?.url || logo;
    }
    return logo;
  })();
  const currency_icon =
    details?.currency_icon ||
    details?.payments?.find((p: any) => p?.currency_icon)?.currency_icon ||
    "";

  const detailsCurrency =
    details?.payout?.currency ||
    details?.payments?.find((p: any) => p?.currency)?.currency ||
    fallbackOffer?.currency ||
    "INR";
  const reward =
    totalReward > 0 ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        {isValidIcon(currency_icon) && (
          <img
            src={currency_icon}
            alt="currency"
            style={{ width: "25px", height: "25px", objectFit: "contain" }}
          />
        )}
        {formatAmount(totalReward)}
      </span>
    ) : (
      fallbackOffer?.earn || ""
    );
  const duration =
    formatExpiryDuration(details?.expiry, details?.expiry_type) !== "Instant"
      ? formatExpiryDuration(details?.expiry, details?.expiry_type)
      : fallbackOffer?.duration || "Instant";
  const deviceOs =
    details?.strictly_os
      ? Object.keys(details.strictly_os.items || {})[0]?.toLowerCase()
      : fallbackOffer?.deviceOs || "";
  const note =
    details?.note ||
    details?.raw?.note ||
    "Offer should be completed within the specified period. You will not be rewarded if you have installed this app before or if you are an old user.";

  const disclaimer =
    details?.disclaimer ||
    details?.raw?.disclaimer ||
    "Fake installs or registrations will not be entertained and will lead to the deactivation of your account.";

  const handleCTAClick = async () => {
    if (!offerId) return;

    try {
      const targetUrl = await resolveTrackedOfferUrl(
        {
          offerId,
          title,
          fallbackUrl: details?.url,
          fallbackPreviewUrl:
            details?.preview_url ||
            fallbackOffer?.url ||
            fallbackOffer?.preview_url,
        },
        sdk,
      );

      if (!targetUrl) return;

      openClaim(targetUrl);
    } catch (err) {
      console.error("Redeem API Failed", err);
    }
  };

  return (
    <Suspense fallback={null}>
      <Modal open={open} onClose={onClose} className="sdk-details-modal">
        <div
          className="sdk-details-root bg-gray-50"
          style={{ minHeight: "100%" }}
        >
          <button
            className="details-back-btn"
            aria-label="Back to offers"
            onClick={() => onBack?.()}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 6L9 12L15 18"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <Suspense fallback={null}>
            <BannerSection image={bannerImage}>
              <div className="banner-fallback">GrowBolt</div>
            </BannerSection>
          </Suspense>

          <div className="sdk-details-container">
            {loading ? (
              <div
                className="gb-loading-container"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 12px 30px rgba(2,6,23,0.08)",
                }}
              >
                <div className="gb-spinner"></div>
                <p style={{ marginTop: 12, color: "#666" }}>
                  Loading offer details...
                </p>
              </div>
            ) : error ? (
              <div
                className="gb-error-container"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 12px 30px rgba(2,6,23,0.08)",
                  padding: "40px 20px",
                }}
              >
                <p style={{ color: "#ef4444", marginBottom: 16 }}>
                  {error}. Showing cached summary instead.
                </p>
                <section className="sdk-section mb-6" style={{ width: "100%" }}>
                  <div className="sdk-overlap-wrapper">
                    <Suspense fallback={null}>
                      <OfferHeaderCard
                        logo={logo}
                        title={title}
                        subtitle={subtitle}
                        duration={duration}
                        reward={reward}
                        deviceOs={deviceOs}
                      />
                    </Suspense>
                  </div>
                </section>
              </div>
            ) : (
              <section className="sdk-section mb-6">
                <div className="sdk-overlap-wrapper">
                  <Suspense fallback={null}>
                    <OfferHeaderCard
                      logo={logo}
                      title={title}
                      subtitle={subtitle}
                      duration={duration}
                      reward={reward}
                      deviceOs={deviceOs}
                    />
                  </Suspense>
                </div>

                <Suspense fallback={null}>
                  {Array.isArray(details?.payments) &&
                    details.payments.length > 0 && (() => {
                      // Only show milestone steps that actually reward the user.
                      // A step with 0 payout (e.g. a free install) is meaningless
                      // to display, so filter those out before rendering.
                      const paymentsList = details.payments.filter(
                        (p: any) => Number(p?.user_payout) > 0,
                      );
                      if (paymentsList.length === 0) return null;
                      const activeIndex = paymentsList.findIndex(
                        (p: any) =>
                          p.status !== "completed" &&
                          p.status !== "rewarded" &&
                          !p.completed
                      );

                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            marginTop: "16px",
                          }}
                        >
                          {paymentsList.map((payment: any, index: number) => {
                            const isCompleted =
                              payment.status === "completed" ||
                              payment.status === "rewarded" ||
                              payment.completed === true;

                            const isActive =
                              !isCompleted &&
                              (activeIndex === -1 ? false : index === activeIndex);

                            const icon = isCompleted
                              ? completedIcon
                              : isActive
                              ? progressIcon
                              : lockedIcon;

                            return (
                              <PaymentMilestoneCard
                                key={payment.id || index}
                                step={index + 1}
                                title={payment.title || payment.goal}
                                description={payment?.description}
                                reward={
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {isValidIcon(payment.currency_icon) && (
                                      <img
                                        src={payment.currency_icon}
                                        alt="currency"
                                        style={{ width: "25px", height: "25px", objectFit: "contain" }}
                                      />
                                    )}
                                    {formatAmount(payment.user_payout)}
                                  </span>
                                }
                                statusIcon={icon}
                                onClaim={handleCTAClick}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}
                </Suspense>

                {note && (
                  <div
                    className="important-note rounded-xl"
                    style={{
                      marginTop: 20,
                      paddingTop: 12,
                      paddingBottom: 18,
                    }}
                  >
                    <div className="important-note-inner">
                      <div className="important-icon">
                        <img src={noteIcon} alt="Note" />
                      </div>

                      <div>
                        <div className="important-title">Important Note</div>

                        <RichContent value={note} className="important-body" />
                      </div>
                    </div>

                    {disclaimer && (
                      <div
                        className="important-note-inner"
                        style={{
                          marginTop: 14,
                          paddingTop: 10,
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="important-icon">
                          <img src={disclaimerIcon} alt="Disclaimer" />
                        </div>

                        <div>
                          <div className="important-title">Disclaimer</div>

                          <RichContent
                            value={disclaimer}
                            className="important-body"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {!loading && (
              <Suspense fallback={null}>
                <StickyCTA onClick={handleCTAClick}>
                  <span className="cta-text">Claim {reward}</span>
                </StickyCTA>
              </Suspense>
            )}
          </div>
        </div>
      </Modal>

      <ClaimLinkModal
        open={claimModalOpen}
        url={claimUrl}
        onClose={closeClaim}
      />
    </Suspense>
  );
}
