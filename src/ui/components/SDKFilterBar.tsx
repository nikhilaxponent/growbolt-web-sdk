import React, { useEffect, useState } from "react";
import Dropdown from "./Dropdown";
import { useSDK } from "../hooks/useSDK";

type Props = {
  category?: string;
  onCategory?: (c: string) => void;
  query?: string;
  onQuery?: (q: string) => void;
  device?: string;
  onDevice?: (d: string) => void;
  payout?: string;
  onPayout?: (p: string) => void;
  sort?: string;
  onSort?: (s: string) => void;
};

const SDKFilterBar: React.FC<Props> = ({
  category = "all",
  onCategory,
  query = "",
  onQuery,
  device,
  onDevice,
  payout,
  onPayout,
  sort,
  onSort,
}) => {
  const sdk = useSDK();
  const [active, setActive] = useState<string>(category);
  const [localQuery, setLocalQuery] = useState<string>(query ?? "");
  const [localDevice, setLocalDevice] = useState<string>(device ?? "");
  const [localPayout, setLocalPayout] = useState<string>(payout ?? "");
  const [localSort, setLocalSort] = useState<string>(sort ?? "trending");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchCats = async () => {
      try {
        const res = await sdk.listCategories();
        if (mounted) setCategories(res as any[]);
      } catch (e) {
        console.warn("[GrowBolt] Failed to fetch categories", e);
      }
    };
    fetchCats();
    return () => { mounted = false; };
  }, [sdk]);

  useEffect(() => {
    const nextCategory = category;
    const nextQuery = query ?? "";
    const nextDevice = device ?? "";
    const nextPayout = payout ?? "";
    const nextSort = sort ?? "trending";

    const raf = requestAnimationFrame(() => {
      if (active !== nextCategory) setActive(nextCategory);
      if (localQuery !== nextQuery) setLocalQuery(nextQuery);
      if (localDevice !== nextDevice) setLocalDevice(nextDevice);
      if (localPayout !== nextPayout) setLocalPayout(nextPayout);
      if (localSort !== nextSort) setLocalSort(nextSort);
    });

    return () => cancelAnimationFrame(raf);
  }, [
    category,
    query,
    device,
    payout,
    sort,
    active,
    localQuery,
    localDevice,
    localPayout,
    localSort,
  ]);

  function handleCategory(c: string) {
    setActive(c);
    onCategory?.(c);
  }

  const pillClass = (c: string) =>
    `pill ${active === c ? "pill-active" : "pill-inactive"}`;

  const deviceOptions = [
    { value: "", label: "All Devices" },
    { value: "android", label: "Android" },
    { value: "ios", label: "iOS" },
  ];

  const payoutOptions = [
    { value: "", label: "Payout Type" },
    { value: "cpa", label: "CPA" },
    { value: "cpi", label: "CPI" },
  ];

  const sortOptions = [
    { value: "trending", label: "Trending" },
    { value: "new", label: "Newest" },
    { value: "high_payout", label: "High Payout" },
  ];

  return (
    <div className="sdk-filter-bar rounded-md p-3 mb-4">
      <div className="filter-row">
        {/* Desktop Dynamic Categories */}
        <div className="filter-pills desktop-categories">
          <button
            aria-pressed={active === "all"}
            className={pillClass("all")}
            onClick={() => handleCategory("all")}
          >
            All
          </button>
          {categories.map((cat) => {
            const catId = String(cat.id || cat.title || "").toLowerCase();
            const catTitle = cat.title || cat.name || cat.id;
            return (
              <button
                key={cat.id || cat.title}
                aria-pressed={active.toLowerCase() === catId}
                className={pillClass(catId)}
                onClick={() => handleCategory(catId)}
              >
                {catTitle}
              </button>
            );
          })}
        </div>

        {/* Mobile Dynamic Categories */}
        <div className="filter-pills mobile-categories">
          <button
            aria-pressed={active === "all"}
            className={pillClass("all")}
            onClick={() => handleCategory("all")}
          >
            All
          </button>
          {categories.map((cat) => {
            const catId = String(cat.id || cat.title || "").toLowerCase();
            const catTitle = cat.title || cat.name || cat.id;
            return (
              <button
                key={cat.id || cat.title}
                aria-pressed={active.toLowerCase() === catId}
                className={pillClass(catId)}
                onClick={() => handleCategory(catId)}
              >
                {catTitle}
              </button>
            );
          })}
        </div>

        <div className="filter-search">
          <input
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              onQuery?.(e.target.value);
            }}
            placeholder="Search For Offers..."
            className="filter-input"
          />
        </div>

        <div className="filter-dropdowns">
          <div className="filter-dropdown">
            <Dropdown
              options={deviceOptions}
              value={localDevice}
              onChange={(v) => {
                setLocalDevice(v as string);
                onDevice?.(v as string);
              }}
              controlClassName="filter-select"
              className=""
            />
          </div>

          <div className="filter-dropdown">
            <Dropdown
              options={payoutOptions}
              value={localPayout}
              onChange={(v) => {
                setLocalPayout(v as string);
                onPayout?.(v as string);
              }}
              controlClassName="filter-select"
              className=""
            />
          </div>

          <div className="filter-dropdown">
            <Dropdown
              options={sortOptions}
              value={localSort}
              onChange={(v) => {
                setLocalSort(v as string);
                onSort?.(v as string);
              }}
              controlClassName="filter-select"
              className=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKFilterBar;
