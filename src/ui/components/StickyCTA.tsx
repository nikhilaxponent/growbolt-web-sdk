import React from "react";

type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
};

export default function StickyCTA({ children, onClick }: Props) {
  return (
    <div className="sticky-cta-wrap">
      <button className="sticky-cta" onClick={onClick}>
        {children}
      </button>
    </div>
  );
}
