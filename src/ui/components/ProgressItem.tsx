/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { OfferModel } from "../types";
import androidIcon from "../assets/android-green.svg";
import iosIcon from "../assets/ios.png";

type Props = {
  item: OfferModel & { status?: string };
};

export default function ProgressItem({ item }: Props) {
  const status = (item as any).status || "progress";
  const amount = item.earn || (item as any).payout || "";
  const device = (item as any).device || "";

  return (
    <div
      className="list-item"
      style={{ position: "relative", alignItems: "center" }}
    >
      {item.logo && <img src={item.logo} alt={item.name} className="logo" />}

      <div className="meta">
        <div className="title">{item.name}</div>
        {item.subtitle && <div className="subtitle">{item.subtitle}</div>}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {device === "android" && (
              <img
                src={androidIcon}
                alt="Android"
                style={{ width: 18, height: 18 }}
              />
            )}
            {device === "ios" && (
              <img src={iosIcon} alt="iOS" style={{ width: 18, height: 18 }} />
            )}
          </div>
        </div>
      </div>

      <div className="right-col">
        <span
          className={`status-badge ${
            status === "completed"
              ? "status-completed"
              : status === "failed"
                ? "status-failed"
                : "status-progress"
          }`}
        >
          {status.toUpperCase()}
        </span>

        <div style={{ fontSize: 20, fontWeight: 500 }} className="offer-reward">
          {amount}
        </div>
      </div>
    </div>
  );
}
