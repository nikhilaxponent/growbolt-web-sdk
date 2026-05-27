import React from "react";
import OfferCard from "./OfferCard";
import type { OfferModel } from "./types";

type Props = {
  items: OfferModel[];
  layout?: "grid" | "list" | "compact-scroll";
  onItemClick?: (m: OfferModel) => void;
};

const OfferList: React.FC<Props> = ({
  items,
  layout = "grid",
  onItemClick,
}) => {
  if (layout === "compact-scroll") {
    if (!items || items.length === 0) {
      return <div className="gb-compact-scroll">No offers</div>;
    }

    return (
      <div className="gb-compact-scroll">
        {items.map((m) => (
          <div key={m.id} className="gb-compact-item">
            <OfferCard model={m} onClick={onItemClick} variant="compact" />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "list") {
    if (!items || items.length === 0) {
      return <div className="gb-list-grid">No offers</div>;
    }

    return (
      <div className="gb-list-grid">
        {items.map((m) => (
          <OfferCard key={m.id} model={m} onClick={onItemClick} />
        ))}
      </div>
    );
  }

  return null;
};

export default OfferList;
