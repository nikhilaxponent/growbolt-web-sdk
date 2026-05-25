import React from "react";
import RewardBadge from "./RewardBadge";

type Props = {
  logo?: string;
  title: string;
  subtitle?: string;
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
          {subtitle && <div className="offer-header-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="offer-header-right">
        {duration && <RewardBadge small>{duration}</RewardBadge>}
        {reward && <div className="offer-reward">{reward}</div>}
      </div>
    </div>
  );
}
