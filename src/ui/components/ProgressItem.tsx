/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { OfferModel } from "../types";
import androidIcon from "../assets/android-green.svg";
import iosIcon from "../assets/ios.png";

type Props = {
  item: OfferModel & { status?: string };
};

export default function ProgressItem({ item }: Props) {
  const [imgError, setImgError] = useState(false);
  const status = (item as any).status || "progress";
  let amount = item.earn || "";
  if (!amount && (item as any).payout) {
    if (typeof (item as any).payout === "object") {
      amount = (item as any).payout.display || (item as any).payout.amount || "";
    } else {
      amount = String((item as any).payout);
    }
  }

  // Find offer in current catalog to enrich information (device, name fallback, subtitle)
  const catalogOffers = (window as any).GrowBolt ? (window as any).GrowBolt.getOffers() : [];
  const catalogOffer = catalogOffers.find((o: any) => String(o.id) === String((item as any).offer_id || item.id));

  const name = item.name || (item as any).title || catalogOffer?.name || "Offer";

  let subtitle = item.subtitle || catalogOffer?.subtitle || "";
  if (subtitle.length > 20) {
    subtitle = subtitle.substring(0, 20) + "...";
  }

  const logo = item.logo || catalogOffer?.logo || "";

  const rawDevice = (item as any).device || (item as any).os || catalogOffer?.device || catalogOffer?.deviceOs || "";
  const deviceStr = String(rawDevice).toLowerCase();
  const isAndroid = deviceStr.includes("android");
  const isIos = deviceStr.includes("ios");

  return (
    <div
      className="list-item"
      style={{ position: "relative", alignItems: "center" }}
    >
      {logo && !imgError ? (
        <img
          src={logo}
          alt={name}
          className="logo"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="logo"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "12px",
            borderRadius: "6px",
            minWidth: "64px",
            minHeight: "64px",
          }}
        >
          {name?.charAt(0)?.toUpperCase() || "G"}
        </div>
      )}

      <div className="meta">
        <div className="title">{name}</div>
        {subtitle && <div className="subtitle">{subtitle}</div>}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isAndroid && (
              <img
                src={androidIcon}
                alt="Android"
                style={{ width: 18, height: 18 }}
              />
            )}
            {isIos && (
              <img src={iosIcon} alt="iOS" style={{ width: 18, height: 18 }} />
            )}
          </div>
        </div>
      </div>

      <div className="right-col">
        <span
          className={`status-badge ${status === "completed"
            ? "status-completed"
            : status === "failed"
              ? "status-failed"
              : "status-progress"
            }`}
        >
          {status.toUpperCase()}
        </span>

        <div style={{ fontSize: 16, fontWeight: 500 }} className="offer-reward">
          {amount}
        </div>
      </div>
    </div>
  );
}
