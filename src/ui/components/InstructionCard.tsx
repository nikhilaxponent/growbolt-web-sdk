import React from "react";
// import RewardBadge from "./RewardBadge";

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
        <div className="instruction-main" style={{width: '100%'}}>
          <div className="instruction-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div className="instruction-title">{title}</div>
            {rightBadge && <div className="instruction-right">{rightBadge}</div>}
          </div>
          <ol className="instruction-list">
            {items.map((it, i) => (
              <li key={i} className="instruction-item">
                {it}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
