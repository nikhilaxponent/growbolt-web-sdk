/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { OfferModel } from "./types";
import { resolveTrackedOfferUrl } from "../utils/offerClick";
import ClaimLinkModal from "./components/ClaimLinkModal";
import androidIcon from "./assets/android-green.svg";
import iosIcon from "./assets/ios.png";
import clockIcon from "./assets/clock1.svg";

type Props = {
  model: OfferModel;
  variant?: "compact" | "regular";
  onClick?: (m: OfferModel) => void;
};

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline";
  }
> = ({ children, className = "", variant = "primary", ...rest }) => {
  const base =
    "w-full h-9 flex items-center justify-center rounded-full font-medium transition-all duration-200";
  const variantClasses = variant === "primary" ? "btn-primary" : "btn-outline";

  return (
    <button {...rest} className={`${base} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

export default function OfferCard({
  model,
  variant = "regular",
  onClick,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [claimUrl, setClaimUrl] = useState("");
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const handle = () => onClick?.(model);

  const handleEarnClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    const trackedUrl = await resolveTrackedOfferUrl({
      offerId: model.id,
      title: model.name,
    });

    if (trackedUrl) {
      setClaimUrl(trackedUrl);
      setClaimModalOpen(true);
    }
  };

  if (variant === "compact") {
    return (
      <div onClick={handle} className="gb-offer-card compact shadow-card">
        {model.logo && !imgError ? (
          <img
            src={model.logo}
            alt={model.name}
            className="w-35 h-35 object-cover"
            style={{ borderRadius: "4px" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-35 h-35 flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: "#000", borderRadius: "8px" }}
          >
            {model.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
        )}
        <div className="text-sm font-semibold text-gray-800 pt-2">
          {model.name}
        </div>

        <div className="text-12 text-gray-500 mb-2">{model.subtitle}</div>

        <Button
          type="button"
          className="pill-earn"
          onClick={handleEarnClick}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
        >
          {model.currency_icon && (
            <img
              src={model.currency_icon}
              alt="currency"
              style={{ width: "25px", height: "25px", objectFit: "contain" }}
            />
          )}
          {model.earn}
        </Button>

        <ClaimLinkModal
          open={claimModalOpen}
          url={claimUrl}
          onClose={() => setClaimModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div onClick={handle} className="list-item">
      {model.logo && !imgError ? (
        <img
          src={model.logo}
          alt={model.name}
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
            minWidth: "70px",
            minHeight: "70px",
          }}
        >
          {model.name?.charAt(0)?.toUpperCase() || "G"}
        </div>
      )}

      <div className="meta">
        <div className="title-row" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
          <div className="title" style={{ whiteSpace: "normal" }}>{model.name}</div>
          
          {(model as any).duration && (
            <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", background: "#f59e0b", color: "#fff", fontSize: "11px", fontWeight: "600", padding: "2px 6px", borderRadius: "12px", flexShrink: 0 }}>
              <img
                src={clockIcon}
                alt="time"
                style={{
                  width: 12,
                  height: 12,
                  marginRight: 4,
                  filter: "brightness(0) invert(1)"
                }}
              />
              {(model as any).duration || "3 Hrs"}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
          {model.subtitle && <div className="subtitle" style={{ whiteSpace: "normal" }}>{model.subtitle}</div>}
          
          {(model.subtitle && (model as any).duration) && (
            <span className="hide-on-desktop" style={{ color: "#6b7280", fontSize: "13px" }}>&bull;</span>
          )}

          <div className="hide-on-desktop" style={{ display: "flex", alignItems: "center", color: "#10b981", fontSize: "12px", fontWeight: "600" }}>
            <img
              src={clockIcon}
              alt="time"
              style={{
                width: 14,
                height: 14,
                marginRight: 4,
                filter: "brightness(0) saturate(100%) invert(60%) sepia(50%) saturate(500%) hue-rotate(110deg) brightness(95%) contrast(90%)"
              }}
            />
            {(model as any).duration || "3 Hrs"}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {((model as any).device === "android" ||
            (model as any).device === "Android") && (
              <img
                src={androidIcon}
                alt="Android"
                style={{ width: 20, height: 20 }}
              />
            )}

          {((model as any).device === "ios" ||
            (model as any).device === "iOS") && (
              <img src={iosIcon} alt="iOS" style={{ width: 20, height: 20 }} />
            )}
        </div>
      </div>

      <button
        type="button"
        className="pill-earn earn-pill"
        onClick={handleEarnClick}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
      >
        {model.currency_icon && (
          <img
            src={model.currency_icon}
            alt="currency"
            style={{ width: "20px", height: "20px", objectFit: "contain" }}
          />
        )}
        {model.earn}
      </button>

      <ClaimLinkModal
        open={claimModalOpen}
        url={claimUrl}
        onClose={() => setClaimModalOpen(false)}
      />
    </div>
  );
}
