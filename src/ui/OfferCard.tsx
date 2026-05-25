import React from "react";
import type { OfferModel } from "./types";

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
  const handle = () => onClick?.(model);

  if (variant === "compact") {
    return (
      <div onClick={handle} className="gb-offer-card compact shadow-card">
        <img
          src={model.logo}
          alt={model.name}
          className="w-35 h-35 object-cover rounded-md"
        />
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
      {model.logo && <img src={model.logo} alt={model.name} className="logo" />}
      <div className="meta">
        <div className="title">{model.name}</div>
        {model.subtitle && <div className="subtitle">{model.subtitle}</div>}
      </div>
      <div className="earn-pill">{model.earn}</div>
    </div>
  );
}
