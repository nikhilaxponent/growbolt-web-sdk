/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Pills from "./components/Pills";
import ProgressItem from "./components/ProgressItem";
import emptyIcon from "./assets/empty.svg"
type Props = {
  onBack?: () => void;
};

export default function ProgressPage({ onBack }: Props) {
  const [active, setActive] = useState<string>("progress");
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    progress: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOngoing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.GrowBolt) throw new Error("GrowBolt SDK not available");

      const config = window.GrowBolt.config;
      const sub4 = window.GrowBolt.sub4 || config?.sub4 || config?.userId || window.GrowBolt.sessionId || "postman";

      const res = await window.GrowBolt.getOngoing({ sub4, tab: active });
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
      } else {
        setItems([]);
      }
      if (res && res.counts) {
        setCounts({
          progress: res.counts.progress || 0,
          completed: res.counts.completed || 0,
          failed: res.counts.failed || 0,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch ongoing offers", err);
      setError(err.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    fetchOngoing();
  }, [fetchOngoing]);

  const filtered = items;

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
    {
      key: "failed",
      label: `Failed (${counts.failed})`,
      count: counts.failed
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Pills options={options} activeKey={active} onChange={setActive} />
      </div>

      {loading && (
        <div className="gb-loading-container" style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="gb-spinner"></div>
          <p style={{ color: "#666", marginTop: 12 }}>Loading progress...</p>
        </div>
      )}

      {error && !loading && (
        <div className="gb-error-container" style={{ padding: "30px", textAlign: "center", background: "#fee2e2", borderRadius: 8 }}>
          <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>
          <button className="gb-retry-btn" onClick={fetchOngoing}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="gb-empty-container" style={{ padding: "60px 0", textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <img src={emptyIcon} alt="Empty" width={150} height={150} />
          </div>
          <div
            className="earn-pill"
            onClick={onBack}
            style={{
              fontWeight: 600,
              fontSize: 22,
              margin: "0 auto",
              width: "200px",
              cursor: "pointer",
            }}
          >
            Explore offer
          </div>
          <p style={{ fontSize: 18, color: "#999", marginTop: 4 }}>Complete a new offer to start earning rewards</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="gb-list-grid" style={{ marginTop: 16, gap: 20 }}>
          {filtered.map((it) => (
            <div key={(it as any).id || (it as any).offer_id}>
              <ProgressItem item={it as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
