/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useState, useEffect } from "react";
const Modal = React.lazy(() => import("./Modal"));
const BannerSection = React.lazy(() => import("./components/BannerSection"));
const OfferHeaderCard = React.lazy(
  () => import("./components/OfferHeaderCard"),
);
const InstructionCard = React.lazy(
  () => import("./components/InstructionCard"),
);
const RewardBadge = React.lazy(() => import("./components/RewardBadge"));
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

  // Fallback mappings if API details aren't loaded or fail
  const title = details?.title || fallbackOffer?.name || "Offer Details";
  const logo = details?.logo || fallbackOffer?.logo;
  const bannerImage = details?.logo || fallbackOffer?.logo;
  const subtitle = details?.description || fallbackOffer?.subtitle || "";
  const reward = details?.payout?.total 
    ? `+$${details.payout.total}` 
    : (fallbackOffer?.earn || "");
  const duration = details?.hold_period 
    ? `${details.hold_period} ${details.hold_type === "hours" ? "Hrs" : "Days"}` 
    : "3 Hrs";
  const note = details?.kpi || "Make sure to complete the steps to be eligible for the reward.";

  // Determine steps
  let instructions: string[] = [
    "Click on the button below to install the app.",
    "Complete the registration or task steps required.",
    "Ensure you remain in the app to qualify for the reward."
  ];

  if (details?.payments && details.payments.length > 0) {
    instructions = details.payments.map((p: any) => p.title || p.goal || "Complete step");
  } else if (details?.description) {
    const lines = details.description
      .split(/\n+/)
      .map((l: string) => l.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      instructions = lines;
    }
  }

  const handleCTAClick = () => {
    let targetUrl = details?.url || details?.preview_url || fallbackOffer?.url || fallbackOffer?.preview_url || "";
    if (targetUrl) {
      try {
        const u = new URL(targetUrl);
        const config = window.GrowBolt?.config;
        const sub4 = config?.sub4 || config?.userId || window.GrowBolt?.sessionId || "";
        if (sub4) {
          u.searchParams.set("sub4", sub4);
          u.searchParams.set("subid4", sub4);
        }
        targetUrl = u.toString();
      } catch (e) {
        // use original
      }
      window.open(targetUrl, "_blank", "noopener,noreferrer");

      window.GrowBolt?.emit("offer_click", {
        offerId,
        title,
        url: targetUrl
      });
    }
  };

  return (
    <Suspense fallback={null}>
      <Modal open={open} onClose={onClose} className="sdk-details-modal">
        <div className="sdk-details-root bg-gray-50" style={{ minHeight: "100%", paddingBottom: "100px" }}>
          {/* Back button to return to SDK list */}
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
              <div className="gb-loading-container" style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 12px 30px rgba(2,6,23,0.08)" }}>
                <div className="gb-spinner"></div>
                <p style={{ marginTop: 12, color: "#666" }}>Loading offer details...</p>
              </div>
            ) : error ? (
              <div className="gb-error-container" style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 12px 30px rgba(2,6,23,0.08)", padding: "40px 20px" }}>
                <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}. Showing cached summary instead.</p>
                {/* Fallback layout is rendered since details failed to load */}
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

                  <Suspense fallback={null}>
                    <InstructionCard
                      title="Details"
                      items={instructions}
                      rightBadge={
                        duration ? (
                          <Suspense fallback={null}>
                            <RewardBadge small>{duration}</RewardBadge>
                          </Suspense>
                        ) : null
                      }
                    />
                  </Suspense>
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

                <Suspense fallback={null}>
                  <InstructionCard
                    title={details?.payments ? "Steps to Earn" : "Details"}
                    items={instructions}
                    rightBadge={
                      duration ? (
                        <Suspense fallback={null}>
                          <RewardBadge small>{duration}</RewardBadge>
                        </Suspense>
                      ) : null
                    }
                  />
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
                        <div className="important-body">{note}</div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {(!loading) && (
            <Suspense fallback={null}>
              <StickyCTA onClick={handleCTAClick}>
                <span className="cta-text">Claim {reward}</span>
              </StickyCTA>
            </Suspense>
          )}
        </div>
      </Modal>
    </Suspense>
  );
}
