/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useEffect } from "react";
import logoImg from "./assets/logo-green.svg";

const SDKModalPage = React.lazy(() => import("./SDKModalPage"));
const SDKDetailsPage = React.lazy(() => import("./SDKDetailsPage"));

export default function SDKLauncher() {
  const [open, setOpen] = React.useState(true);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = React.useState<any | null>(null);

  useEffect(() => {
    async function loadOffers() {
      console.log("GrowBolt on window:", window.GrowBolt);

      const GrowBolt = window.GrowBolt;
      if (!GrowBolt) {
        console.error("GrowBolt SDK not loaded");
        return;
      }

      try {
        // 1. Initialize SDK
        const initResponse = await GrowBolt.init({
          apiKey: "bEUroJ9o9bC4OLF_AXdaPtWR8MWM_RiZgXSA04ckOpo",
          baseUrl: "http://localhost",
        });

        console.log("Init Response:", initResponse);

        // 2. Fetch offers from API
        const apiOffers = await GrowBolt.listOffers();

        console.log("API Offers:", apiOffers);

        // 3. Transform API response to UI format
        const mappedOffers = apiOffers.map((offer: any) => ({
          id: offer.id,
          name: offer.title,
          subtitle: offer.payout?.title || "Complete offer and earn rewards",
          logo: offer.logo,
          earn: `₹${offer.payout?.total || 0}`,
          duration: "Instant",
          raw: offer,
        }));

        console.log("Mapped Offers:", mappedOffers);
        console.log("Offers Count:", mappedOffers.length);
        console.log("First Offer:", mappedOffers[0]);
        // 4. Update UI
        setOffers(mappedOffers);
      } catch (err) {
        console.error("SDK Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, []);
  if (loading) {
    return <div>Loading offers...</div>;
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
          items={offers}
          onClose={() => setOpen(false)}
          onItemClick={(m) => {
            setSelectedOffer(m);
            setOpen(false);
            setDetailsOpen(true);
          }}
        />

        <SDKDetailsPage
          open={detailsOpen}
          offerId={selectedOffer?.id || null}
          fallbackOffer={selectedOffer}
          onClose={() => setDetailsOpen(false)}
          onBack={() => {
            setDetailsOpen(false);
            setOpen(true);
          }}
        />
      </Suspense>
    </div>
  );
}
