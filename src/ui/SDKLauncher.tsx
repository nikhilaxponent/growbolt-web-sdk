import React, { Suspense } from "react";
import type { SDKSection } from "./SDKDetailsPage";
import logoImg from "./assets/logo-green.svg";

const SDKModalPage = React.lazy(() => import("./SDKModalPage"));
const SDKDetailsPage = React.lazy(() => import("./SDKDetailsPage"));

const sample = [
  {
    id: "1",
    name: "SuperApp",
    subtitle: "Install and earn",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$3.50",
  },
  {
    id: "2",
    name: "MegaGame",
    subtitle: "Play to win",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$5.00",
  },
  {
    id: "3",
    name: "ShopNow",
    subtitle: "Sign up offer",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$2.00",
  },
  {
    id: "3",
    name: "ShopNow",
    subtitle: "Sign up offer",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$2.00",
  },
  {
    id: "3",
    name: "ShopNow",
    subtitle: "Sign up offer",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$2.00",
  },
  {
    id: "3",
    name: "ShopNow",
    subtitle: "Sign up offer",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$2.00",
  },
];

export default function SDKLauncher() {
  const [open, setOpen] = React.useState(true);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<SDKSection | null>(
    null,
  );

  function openDetailsFromOffer(m: {
    id: string;
    name: string;
    subtitle?: string;
    logo?: string;
    earn?: string;
  }) {
    const section: SDKSection = {
      id: m.id,
      logo: m.logo,
      bannerImage: m.logo,
      title: m.name,
      subtitle: m.subtitle,
      reward: m.earn,
      duration: "3 Hrs",
      instructions: [
        "Click on the button below to install the app",
        "Complete the app installation.",
        "Add items and make your first order.",
      ],
      note: "Make sure to complete the steps to be eligible for the reward.",
    };

    setActiveSection(section);
    setDetailsOpen(true);
  }

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open SDK Modal</button>
      <Suspense fallback={null}>
        <SDKModalPage
          open={open}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={logoImg}
                alt="logo"
                className="modal-logo"
                style={{ height: 45 }}
              />
              <span style={{ fontWeight: 800, fontSize: 16 }}></span>
            </div>
          }
          items={sample}
          onClose={() => setOpen(false)}
          onItemClick={(m) => openDetailsFromOffer(m)}
        />

        <SDKDetailsPage
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onBack={() => {
            setDetailsOpen(false);
            setOpen(true);
          }}
          sections={activeSection ? [activeSection] : []}
        />
      </Suspense>
    </div>
  );
}
