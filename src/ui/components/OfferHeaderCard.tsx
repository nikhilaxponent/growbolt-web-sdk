import React from "react";
import RewardBadge from "./RewardBadge";
import RichContent from "./RichContent";

type Props = {
  logo?: string;
  title: string;
  subtitle?: unknown;
  reward?: string;
  duration?: string;
};

export default function OfferHeaderCard({
  logo,
  title,
  subtitle,
  reward,
  duration,
}: Props) {
  return (
    <div className="offer-header-card shadow-card rounded-2xl ">
      <div className="offer-header-left">
        {logo && <img src={logo} alt="logo" className="offer-header-logo" />}
        <div>
          <div className="offer-header-title">{title}</div>
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
        <div className="offer-header-right-stack">
          {duration && <RewardBadge small>{duration}</RewardBadge>}
          {reward && <div className="offer-reward">{reward}</div>}
        </div>
      </div>
    </div>
  );
}
