import React from "react";

type PillOption = {
  key: string;
  label: string;
  count?: number;
};

type Props = {
  options: PillOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
};

export default function Pills({
  options,
  activeKey,
  onChange,
  className = "",
}: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter pills"
      className={className}
      style={{ display: "flex", gap: 12 }}
    >
      {options.map((opt) => {
        const active = opt.key === activeKey;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={"pill " + (active ? "pill-active" : "pill-inactive")}
            style={{
              padding: "14px 15px",
              borderRadius: 999,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
