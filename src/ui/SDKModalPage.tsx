/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, Suspense, useEffect } from "react";
import { mapApiOfferToModel } from "./mapOffer";
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
  const [remoteItems, setRemoteItems] = useState<OfferModel[] | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;

    const search = query.trim();
    const os = device || undefined;
    const hasApiFilters = Boolean(search || os);

    if (!hasApiFilters) {
      setRemoteItems(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const GrowBolt = window.GrowBolt;
      if (!GrowBolt) return;

      setFetching(true);
      try {
        const apiOffers = await GrowBolt.listOffers({
          search: search || undefined,
          os,
          forceRefresh: true,
        });
        if (cancelled) return;
        setRemoteItems(apiOffers.map((offer: any) => mapApiOfferToModel(offer)));
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch filtered offers", err);
          setRemoteItems([]);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, device]);

  const sourceItems = remoteItems ?? items;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sourceItems.filter((m) => {
      if (category !== "all") {
        const cat = (m as any).category;
        if (!cat || cat !== category) return false;
      }

      if (q && remoteItems === null) {
        const name = (m.name || "").toString().toLowerCase();
        const subtitle = ((m as any).subtitle || "").toString().toLowerCase();
        if (!name.includes(q) && !subtitle.includes(q)) return false;
      }

      if (device) {
        const devOs = ((m as any).deviceOs || "").toString().toLowerCase();
        const devLabel = ((m as any).device || "").toString().toLowerCase();
        const wanted = device.toLowerCase();
        if (devOs !== wanted && !devLabel.includes(wanted)) return false;
      }

      if (payout) {
        const p = ((m as any).payoutType || "").toString().toLowerCase();
        if (p && p !== payout.toLowerCase()) return false;
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
        const parseEarn = (v: unknown) => {
          const n = parseFloat(String(v || "").replace(/[^\d.]/g, ""));
          return Number.isFinite(n) ? n : 0;
        };
        return parseEarn((b as any).earn) - parseEarn((a as any).earn);
      });
    }

    return list;
  }, [sourceItems, category, query, device, payout, sort, remoteItems]);

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
            <ProgressPage onBack={() => setShowStatus(false)} />
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

              {fetching && (
                <p className="sdk-section-title" style={{ opacity: 0.7 }}>
                  Updating offers…
                </p>
              )}

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
