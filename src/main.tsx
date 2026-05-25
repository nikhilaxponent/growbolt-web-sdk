import React from "react";
import { createRoot } from "react-dom/client";
import SDKModalPage from "./ui/SDKModalPage";
import SDKDetailsPage, { type SDKSection } from "./ui/SDKDetailsPage";
import "./ui/styles.css";
import logoImg from "./ui/assets/logo-green.svg";

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
    id: "4",
    name: "CloudSafe",
    subtitle: "Free trial",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$4.25",
  },
  {
    id: "5",
    name: "PhotoPro",
    subtitle: "Install & create",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$1.75",
  },
  {
    id: "6",
    name: "StreamIt",
    subtitle: "Subscribe offer",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$6.00",
  },
  {
    id: "7",
    name: "FitTrack",
    subtitle: "Download app",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+$2.50",
  },
];

export default function App() {
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
    const section = {
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
    <div style={{ fontFamily: "Inter, system-ui, Arial", padding: 20 }}>
      <button onClick={() => setOpen(true)}>Open SDK Modal</button>
      <SDKModalPage
        open={open}
        title={
          logoImg ? (
            <img src={logoImg} alt="logo" className="modal-logo" />
          ) : (
            "Available Offers"
          )
        }
        items={sample}
        onClose={() => setOpen(false)}
        onItemClick={(m) => {
          openDetailsFromOffer(m);
        }}
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
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
