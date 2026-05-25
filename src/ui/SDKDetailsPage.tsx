import React from "react";
import Modal from "./Modal";
import BannerSection from "./components/BannerSection";
import OfferHeaderCard from "./components/OfferHeaderCard";
import InstructionCard from "./components/InstructionCard";
import RewardBadge from "./components/RewardBadge";
import StickyCTA from "./components/StickyCTA";

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
        <BannerSection image={sections?.[0]?.bannerImage}>
          <div className="banner-fallback">GrowBolt</div>
        </BannerSection>

        <div className="sdk-details-container">
          {sections.map((s) => (
            <section key={s.id} className="sdk-section mb-6">
              <div className="sdk-overlap-wrapper">
                <OfferHeaderCard
                  logo={s.logo}
                  title={s.title}
                  subtitle={s.subtitle}
                  duration={s.duration}
                  reward={s.reward}
                />
              </div>

              <InstructionCard
                title={s.instructions ? "Download & Shop" : "Details"}
                items={s.instructions}
                rightBadge={
                  s.duration ? (
                    <RewardBadge small>{s.duration}</RewardBadge>
                  ) : null
                }
              />

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

        <StickyCTA>
          <span className="cta-text">Claim ₹60.00</span>
        </StickyCTA>
      </div>
    </Modal>
  );
}
