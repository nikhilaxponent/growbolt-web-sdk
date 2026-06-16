import React from "react";
import RewardBadge from "./RewardBadge";
import RichContent from "./RichContent";
import androidIcon from "../assets/android-green.svg";
import iosIcon from "../assets/ios.png";

type Props = {
  logo?: string;
  title: string;
  subtitle?: unknown;
  reward?: React.ReactNode;
  duration?: string;
  deviceOs?: string;
};

export default function OfferHeaderCard({
  logo,
  title,
  subtitle,
  reward,
  duration,
  deviceOs,
}: Props) {
  const isAndroid = deviceOs === "android" || deviceOs === "Android";
  const isIos = deviceOs === "ios" || deviceOs === "iOS";

  return (
    <div className="offer-header-card shadow-card rounded-2xl ">
      <div className="offer-header-left" style={{ flex: 1, minWidth: 0 }}>
        {logo && <img src={logo} alt="logo" className="offer-header-logo" />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="offer-header-title" style={{ marginRight: 4 }}>{title}</span>
            {duration && <RewardBadge small>{duration}</RewardBadge>}
            {isAndroid && (
              <img
                src={androidIcon}
                alt="Android"
                style={{ width: 20, height: 20, flexShrink: 0 }}
              />
            )}
            {isIos && (
              <img
                src={iosIcon}
                alt="iOS"
                style={{ width: 20, height: 20, flexShrink: 0 }}
              />
            )}
          </div>
          {subtitle ? (
            <RichContent
              value={subtitle}
              className="offer-header-sub"
              as="div"
            />
          ) : null}
        </div>
      </div>
      <div className="offer-header-right">
        <div className="offer-header-right-stack" style={{ alignItems: "flex-end", gap: "2px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, textAlign: "center", }}>Earn</div>
          {reward && <div className="offer-reward" style={{ fontSize: "22px", fontWeight: 800 }}>{reward}</div>}
        </div>
      </div>
    </div>
  );
}
