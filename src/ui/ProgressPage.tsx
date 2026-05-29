/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Pills from "./components/Pills";
import ProgressItem from "./components/ProgressItem";
import type { OfferModel } from "./types";

type Props = {
  items: (OfferModel & { status?: string })[];
  onBack?: () => void;
};

export default function ProgressPage({ items }: Props) {
  const [active, setActive] = React.useState<string>("progress");

  const counts = React.useMemo(() => {
    const map: Record<string, number> = {
      progress: 0,
      completed: 0,
      failed: 0,
    };
    items.forEach((it) => {
      const s = (it as any).status || "progress";
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [items]);

  const options = [
    {
      key: "progress",
      label: `Progress (${counts.progress})`,
      count: counts.progress,
    },
    {
      key: "completed",
      label: `Completed (${counts.completed})`,
      count: counts.completed,
    },
    { key: "failed", label: `Failed (${counts.failed})`, count: counts.failed },
  ];

  const filtered = items.filter((it) => (it as any).status === active);

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 50,
        }}
      >
        <Pills options={options} activeKey={active} onChange={setActive} />
      </div>

      <div className="gb-list-grid" style={{ marginTop: 16, gap: 20 }}>
        {filtered.map((it) => (
          <div key={(it as any).id || (it as any).offerId}>
            <ProgressItem item={it as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
