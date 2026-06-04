/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { OfferModel } from "./types";
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

  const handle = () => onClick?.(model);

  if (variant === "compact") {
    return (
      <div onClick={handle} className="gb-offer-card compact shadow-card">
        {model.logo && !imgError ? (
          <img
            src={model.logo}
            alt={model.name}
            className="w-35 h-35 object-cover rounded-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-35 h-35 rounded-md flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: "#000" }}
          >
            {model.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
        )}

        <div className="text-sm font-semibold text-gray-800 pt-2">
          {model.name}
        </div>

        <div className="text-12 text-gray-500 mb-2">{model.subtitle}</div>

        <Button>{model.earn}</Button>
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
            fontSize: "20px",
            borderRadius: "8px",
            minWidth: "60px",
            minHeight: "60px",
          }}
        >
          {model.name?.charAt(0)?.toUpperCase() || "G"}
        </div>
      )}

      <div className="meta">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="title">{model.name}</div>

          <span className="pill-timer" style={{ marginLeft: 6 }}>
            <img
              src={clockIcon}
              alt="time"
              style={{
                width: 14,
                height: 14,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            {(model as any).duration || "3 Hrs"}
          </span>
        </div>

        {model.subtitle && <div className="subtitle">{model.subtitle}</div>}

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

      <div className="earn-pill">{model.earn}</div>
    </div>
  );
}
