/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useEffect } from "react";
import logoImg from "./assets/logo-green.svg";
import { mapApiOfferToModel } from "./mapOffer";

const SDKModalPage = React.lazy(() => import("./SDKModalPage"));
const SDKDetailsPage = React.lazy(() => import("./SDKDetailsPage"));

type SDKLauncherProps = {
  onClose?: () => void;
};

export default function SDKLauncher({ onClose }: SDKLauncherProps) {
  const [open, setOpen] = React.useState(true);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = React.useState<any | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  useEffect(() => {
    async function loadOffers() {
      const GrowBolt = window.GrowBolt;
      if (!GrowBolt) {
        setLoadError("GrowBolt SDK script is not loaded.");
        setLoading(false);
        return;
      }

      if (!GrowBolt.config?.apiKey) {
        setLoadError(
          "SDK not initialized. Call GrowBolt.init({ apiKey: 'YOUR_KEY' }) before openOfferwall().",
        );
        setLoading(false);
        return;
      }

      try {
        const apiOffers = await GrowBolt.listOffers();
        setOffers(apiOffers.map((offer: any) => mapApiOfferToModel(offer)));
        setLoadError(null);
      } catch (err) {
        console.error("SDK Error:", err);
        setLoadError("Failed to load offers.");
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, []);

  if (loading) {
    return <div className="gb-sdk-loading">Loading offers...</div>;
  }

  if (loadError) {
    return (
      <div className="gb-sdk-error" style={{ padding: 24, color: "#b91c1c" }}>
        {loadError}
      </div>
    );
  }

  return (
    <div>
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
          onClose={onClose ? onClose : () => setOpen(false)}
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
