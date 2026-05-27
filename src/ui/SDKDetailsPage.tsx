import React, { Suspense } from "react";
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

export type SDKSection = {
  id: string;
  logo?: string;
  bannerImage?: string;
  title: string;
  subtitle?: string;
  duration?: string;
  reward?: string;
  instructions?: string[];
  note?: string;
};

type Props = {
  open: boolean;
  onClose?: () => void;
  onBack?: () => void;
  sections: SDKSection[];
};

export default function SDKDetailsPage({
  open,
  onClose,
  onBack,
  sections,
}: Props) {
  return (
    <Suspense fallback={null}>
      <Modal open={open} onClose={onClose} className="sdk-details-modal">
        <div className="sdk-details-root bg-gray-50">
          {/* Back button to return to SDK list */}
          <button
            className="details-back-btn"
            aria-label="Back to offers"
            onClick={() => onBack?.()}
          >
            {"<"}
          </button>
          {/* Banner uses first section banner by default, but page supports many sections below */}
          <Suspense fallback={null}>
            <BannerSection image={sections?.[0]?.bannerImage}>
              <div className="banner-fallback">GrowBolt</div>
            </BannerSection>
          </Suspense>

          <div className="sdk-details-container">
            {sections.map((s) => (
              <section key={s.id} className="sdk-section mb-6">
                <div className="sdk-overlap-wrapper">
                  <Suspense fallback={null}>
                    <OfferHeaderCard
                      logo={s.logo}
                      title={s.title}
                      subtitle={s.subtitle}
                      duration={s.duration}
                      reward={s.reward}
                    />
                  </Suspense>
                </div>

                <Suspense fallback={null}>
                  <InstructionCard
                    title={s.instructions ? "Download & Shop" : "Details"}
                    items={s.instructions}
                    rightBadge={
                      s.duration ? (
                        <Suspense fallback={null}>
                          <RewardBadge small>{s.duration}</RewardBadge>
                        </Suspense>
                      ) : null
                    }
                  />
                </Suspense>

                {s.note && (
                  <div
                    className="important-note rounded-xl"
                    style={{ marginTop: 20, paddingTop: 12 }}
                  >
                    <div className="important-note-inner">
                      <div className="important-icon">⚠️</div>
                      <div>
                        <div className="important-title">Important Note</div>
                        <div className="important-body">{s.note}</div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          <Suspense fallback={null}>
            <StickyCTA>
              <span className="cta-text">Claim ₹60.00</span>
            </StickyCTA>
          </Suspense>
        </div>
      </Modal>
    </Suspense>
  );
}
