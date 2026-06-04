import React from "react";

type Props = {
  children: React.ReactNode;
  small?: boolean;
};

export default function RewardBadge({ children, small }: Props) {
  return (
    <div
      style={{ color: "#fff" }}
      className={"reward-badge " + (small ? "reward-badge-sm" : "")}
    >
      {children}
    </div>
  );
}
