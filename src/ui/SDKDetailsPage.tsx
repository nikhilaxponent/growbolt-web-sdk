/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useState, useEffect } from "react";
import { toPlainText } from "../utils/sanitizeContent";
import PaymentMilestoneCard from "./components/PaymentMilestoneCard";
import ClaimLinkModal from "./components/ClaimLinkModal";
import RichContent from "./components/RichContent";
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
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimUrl, setClaimUrl] = useState("");

  useEffect(() => {
    if (!open || !offerId) {
      setDetails(null);
      setError(null);
      return;
    }

    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        if (!window.GrowBolt) throw new Error("GrowBolt SDK not available");
        const res = await window.GrowBolt.getOfferDetails(offerId!);

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
  }, [open, offerId]);

  const formatAmount = (value: string | number | undefined) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  const totalReward =
    details?.payments?.reduce(
      (sum: number, payment: any) => sum + Number(payment.total || 0),
      0,
    ) || 0;

  const title =
    toPlainText(details?.title) || fallbackOffer?.name || "Offer Details";
  const subtitle =
    details?.description || fallbackOffer?.subtitle || "";
  const logo = details?.logo || details?.logo_source || fallbackOffer?.logo || "";
  const bannerImage = logo;
  const reward =
    totalReward > 0
      ? `₹${formatAmount(totalReward)}`
      : fallbackOffer?.earn || "";
  const duration =
    details?.expiry_days > 0
      ? `${details.expiry_days} ${
          details?.expiry_type === "hours" ? "Hours" : "Days"
        }`
      : "Instant";
  const note =
    details?.note ||
    "Complete all required steps and keep the app installed until tracking is complete.";

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

  const handleCTAClick = async () => {
    if (!offerId) return;

    try {
      if (!window.GrowBolt?.redeemOffer) {
        console.error("redeemOffer method not found on GrowBolt");
        return;
      }

      const redeemResponse = await window.GrowBolt.redeemOffer(String(offerId));

      let targetUrl =
        redeemResponse?.url ||
        redeemResponse?.click_url ||
        details?.url ||
        details?.preview_url ||
        fallbackOffer?.url ||
        fallbackOffer?.preview_url ||
        "";

      if (!targetUrl) return;

      targetUrl = buildAttributedUrl(targetUrl);
      setClaimUrl(targetUrl);
      setClaimModalOpen(true);

      window.GrowBolt?.emit("offer_click", {
        offerId,
        title,
        url: targetUrl,
      });
    } catch (err) {
      console.error("Redeem API Failed", err);
    }
  };

  return (
    <Suspense fallback={null}>
      <Modal open={open} onClose={onClose} className="sdk-details-modal">
        <div
          className="sdk-details-root bg-gray-50"
          style={{ minHeight: "100%", paddingBottom: "100px" }}
        >
          <button
            className="details-back-btn"
            aria-label="Back to offers"
            onClick={() => onBack?.()}
          >
            {"<"}
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
                    />
                  </Suspense>
                </div>

                {subtitle && (
                  <div
                    className="sdk-details-description"
                    style={{ marginTop: 16 }}
                  >
                    <RichContent value={subtitle} className="offer-description" />
                  </div>
                )}

                <Suspense fallback={null}>
                  {Array.isArray(details?.payments) &&
                    details.payments.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginTop: "16px",
                        }}
                      >
                        {details.payments.map((payment: any, index: number) => (
                          <PaymentMilestoneCard
                            key={payment.id || index}
                            step={index + 1}
                            title={payment.title || payment.goal}
                            description={payment.description}
                            reward={`${formatAmount(payment.total)}`}
                          />
                        ))}
                      </div>
                    )}
                </Suspense>

                {note && (
                  <div
                    className="important-note rounded-xl"
                    style={{ marginTop: 20, paddingTop: 12 }}
                  >
                    <div className="important-note-inner">
                      <div className="important-icon">⚠️</div>
                      <div>
                        <div className="important-title">Important Note</div>
                        <RichContent
                          value={note}
                          className="important-body"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {!loading && (
            <Suspense fallback={null}>
              <StickyCTA onClick={handleCTAClick}>
                <span className="cta-text">Claim {reward}</span>
              </StickyCTA>
            </Suspense>
          )}
        </div>
      </Modal>

      <ClaimLinkModal
        open={claimModalOpen}
        url={claimUrl}
        onClose={() => setClaimModalOpen(false)}
      />
    </Suspense>
  );
}
