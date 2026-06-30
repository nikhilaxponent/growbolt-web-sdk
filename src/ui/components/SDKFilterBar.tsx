import React, { useEffect, useState } from "react";
import Dropdown from "./Dropdown";

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
        const GrowBolt = (window as any).GrowBolt;
        if (GrowBolt && GrowBolt.listCategories) {
          const res = await GrowBolt.listCategories();
          if (mounted) setCategories(res);
        }
      } catch (e) {
        console.warn("[GrowBolt] Failed to fetch categories", e);
      }
    };
    fetchCats();
    return () => { mounted = false; };
  }, []);

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
        {/* Desktop Static Categories */}
        <div className="filter-pills desktop-categories">
          <button
            aria-pressed={active === "all"}
            className={pillClass("all")}
            onClick={() => handleCategory("all")}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2a9 9 0 109 9 9 9 0 00-9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All
          </button>
          <button
            aria-pressed={active === "apps"}
            className={pillClass("apps")}
            onClick={() => handleCategory("apps")}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.4" rx="1" />
              <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.4" rx="1" />
              <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.4" rx="1" />
              <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.4" rx="1" />
            </svg>
            Apps
          </button>
          <button
            aria-pressed={active === "games"}
            className={pillClass("games")}
            onClick={() => handleCategory("games")}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6 12c0-2 1.5-4 3.5-4h5c2 0 3.5 2 3.5 4v2a3 3 0 01-3 3h-6a3 3 0 01-3-3v-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 11v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 11v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Games
          </button>
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
          {categories.map((cat) => (
            <button
              key={cat.id}
              aria-pressed={active === cat.id}
              className={pillClass(cat.id)}
              onClick={() => handleCategory(cat.id)}
            >
              {cat.title}
            </button>
          ))}
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
