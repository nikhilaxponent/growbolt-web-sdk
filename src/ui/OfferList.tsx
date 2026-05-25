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
    return (
      <div className="flex gap-4 overflow-x-auto py-1">
        {items.map((m) => (
          <div key={m.id} className="w-60 shrink-0">
            <OfferCard model={m} onClick={onItemClick} variant="compact" />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {items.map((m) => (
          <OfferCard key={m.id} model={m} onClick={onItemClick} />
        ))}
      </div>
    );
  }

  return null;
};

export default OfferList;
