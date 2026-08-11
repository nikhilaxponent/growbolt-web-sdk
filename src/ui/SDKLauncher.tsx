/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import logoImg from './assets/logo-green.svg';
import { mapApiOfferToModel } from './mapOffer';
import { useSDK } from './hooks/useSDK';

const SDKModalPage = React.lazy(() => import('./SDKModalPage'));
const SDKDetailsPage = React.lazy(() => import('./SDKDetailsPage'));

type SDKLauncherProps = {
  onClose?: () => void;
};

export default function SDKLauncher({ onClose }: SDKLauncherProps) {
  const sdk = useSDK();
  const [open, setOpen] = React.useState(true);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = React.useState<any | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const detailsOpenRef = React.useRef(detailsOpen);
  React.useEffect(() => {
    detailsOpenRef.current = detailsOpen;
  }, [detailsOpen]);

  const handleClose = React.useCallback(() => {
    if (onClose) onClose();
    else setOpen(false);
  }, [onClose]);

  // Map the hardware / browser Back button to in-offerwall navigation:
  // Details → list (same as the back arrow), then list → close. Without this,
  // Back inside a WebView exits the whole offerwall, because the list↔details
  // navigation is React state, not browser history.
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.history) return;

    // Arm a history entry so the first Back press is captured by the offerwall.
    window.history.pushState({ gbOfferwall: true }, "");

    const onPop = () => {
      if (detailsOpenRef.current) {
        // On the details page → return to the list and re-arm the trap.
        setDetailsOpen(false);
        setOpen(true);
        window.history.pushState({ gbOfferwall: true }, "");
      } else {
        // On the list → close the offerwall.
        handleClose();
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [handleClose]);

  React.useEffect(() => {
    async function loadOffers() {
      if (!sdk.config?.apiKey) {
        setLoadError(
          "SDK not initialized. Call GrowBolt.init({ apiKey: 'YOUR_KEY' }) before openOfferwall().",
        );
        setLoading(false);
        return;
      }
      try {
        const apiOffers = await sdk.listOffers();
        setOffers((apiOffers as any[]).map((offer: any) => mapApiOfferToModel(offer)));
        setLoadError(null);
      } catch (err) {
        console.error('SDK Error:', err);
        setLoadError('Failed to load offers.');
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, [sdk]);

  if (loading) {
    return <div className="gb-sdk-loading">Loading offers...</div>;
  }

  if (loadError) {
    return (
      <div className="gb-sdk-error" style={{ padding: 24, color: '#b91c1c' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          onClose={handleClose}
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
