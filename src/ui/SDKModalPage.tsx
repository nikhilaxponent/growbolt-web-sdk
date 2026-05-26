import React from "react";
import Modal from "./Modal";
import OfferList from "./OfferList";
import SDKFilterBar from "./components/SDKFilterBar";
import type { OfferModel } from "./types";

type Props = {
  open: boolean;
  title?: React.ReactNode;
  items: OfferModel[];
  onClose?: () => void;
  onItemClick?: (m: OfferModel) => void;
};

export default function SDKModalPage({
  open,
  title = "Offers",
  items,
  onClose,
  onItemClick,
}: Props) {
  const trending = items.slice(0, 6);

  return React.createElement(
    Modal,
    { open, title, onClose, className: "sdk-modal-page" },
    React.createElement(
      "div",
      { className: "sdk-modal-section" },
      React.createElement(SDKFilterBar, {}),
      React.createElement(
        "h3",
        { className: "sdk-section-title" },
        "Trending Offers",
      ),
      React.createElement(OfferList, {
        items: trending,
        layout: "compact-scroll",
        onItemClick,
      }),
    ),
    React.createElement(
      "div",
      { className: "sdk-modal-section" },
      React.createElement(
        "h3",
        { className: "sdk-section-title" },
        "All Offers",
      ),
      React.createElement(OfferList, { items, layout: "list", onItemClick }),
    ),
  );
}
