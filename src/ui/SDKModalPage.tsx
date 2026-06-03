/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, Suspense } from "react";
const Modal = React.lazy(() => import("./Modal"));
const OfferList = React.lazy(() => import("./OfferList"));
const SDKFilterBar = React.lazy(() => import("./components/SDKFilterBar"));
const ProgressPage = React.lazy(() => import("./ProgressPage"));
import type { OfferModel } from "./types";

type Props = {
  open: boolean;
  title?: React.ReactNode;
  items: OfferModel[];
  onClose?: () => void;
  onItemClick?: (m: OfferModel) => void;
};

export default function SDKModalPage({
  open,
  title = "Offers",
  items,
  onClose,
  onItemClick,
}: Props) {
  const [showStatus, setShowStatus] = useState(false);
  const [category, setCategory] = useState<"all" | "apps" | "games">("all");
  const [query, setQuery] = useState<string>("");
  const [device, setDevice] = useState<string>("");
  const [payout, setPayout] = useState<string>("");
  const [sort, setSort] = useState<string>("trending");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((m) => {
      if (category !== "all") {
        const cat = (m as any).category;
        if (typeof cat === "string" && cat !== category) return false;
      }

      if (q) {
        const name = (m.name || "").toString().toLowerCase();
        const subtitle = ((m as any).subtitle || "").toString().toLowerCase();
        if (!name.includes(q) && !subtitle.includes(q)) return false;
      }

      if (device) {
        const dev = (m as any).device;
        if (typeof dev === "string" && dev !== device) return false;
      }

      if (payout) {
        const p = (m as any).payout || (m as any).earn;
        if (typeof p === "string" && !p.toLowerCase().includes(payout))
          return false;
      }

      return true;
    });

    if (sort === "new") {
      return list.slice().sort((a, b) => {
        const ta = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
        const tb = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
        return tb - ta;
      });
    }

    if (sort === "high_payout") {
      return list.slice().sort((a, b) => {
        const va = Number((a as any).payout || (a as any).earn || 0) || 0;
        const vb = Number((b as any).payout || (b as any).earn || 0) || 0;
        return vb - va;
      });
    }

    return list;
  }, [items, category, query, device, payout, sort]);

  const trending = filtered.slice(0, 6);

  return (
    <Suspense fallback={null}>
      <Modal
        open={open}
        title={showStatus ? "My Progress" : title}
        onClose={onClose}
        className="sdk-modal-page"
        onAction={!showStatus ? () => setShowStatus(true) : undefined}
        onBack={showStatus ? () => setShowStatus(false) : undefined}
      >
        {showStatus ? (
          <Suspense fallback={null}>
            <ProgressPage
              onBack={() => setShowStatus(false)}
            />
          </Suspense>
        ) : (
          <>
            <div className="sdk-modal-section">
              <Suspense fallback={null}>
                <SDKFilterBar
                  category={category}
                  onCategory={(c) => setCategory(c)}
                  query={query}
                  onQuery={(q) => setQuery(q)}
                  device={device}
                  onDevice={(d) => setDevice(d)}
                  payout={payout}
                  onPayout={(p) => setPayout(p)}
                  sort={sort}
                  onSort={(s) => setSort(s)}
                />
              </Suspense>

              <h3 className="sdk-section-title">Trending Offers</h3>
              <Suspense fallback={null}>
                <OfferList
                  items={trending}
                  layout="compact-scroll"
                  onItemClick={onItemClick}
                />
              </Suspense>
            </div>

            <div className="sdk-modal-section">
              <h3 className="sdk-section-title">All Offers</h3>
              <Suspense fallback={null}>
                <OfferList
                  items={filtered}
                  layout="list"
                  onItemClick={onItemClick}
                />
              </Suspense>
            </div>
          </>
        )}
      </Modal>
    </Suspense>
  );
}
