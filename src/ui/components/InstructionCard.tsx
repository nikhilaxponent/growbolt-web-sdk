import React from "react";
import RewardBadge from "./RewardBadge";

type Props = {
  title?: string;
  items?: string[];
  rightBadge?: React.ReactNode;
};

export default function InstructionCard({
  title = "Instructions",
  items = [],
  rightBadge,
}: Props) {
  return (
    <div className="instruction-card rounded-xl shadow-card">
      <div className="instruction-card-inner">
        <div className="instruction-main">
          <div className="instruction-title">{title}</div>
          <ol className="instruction-list">
            {items.map((it, i) => (
              <li key={i} className="instruction-item">
                {it}
              </li>
            ))}
          </ol>
        </div>
        {rightBadge && <div className="instruction-right">{rightBadge}</div>}
      </div>
    </div>
  );
}
