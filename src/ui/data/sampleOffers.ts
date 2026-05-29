import type { OfferModel } from "../types";

export const sampleOffers: OfferModel[] = [
  {
    id: "1",
    name: "Share Market",
    subtitle: "Register Now to invest in share Market",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+₹6",
    sections: [],
    device: "android",
    duration: "3 Hrs",
  },
  {
    id: "2",
    name: "PhotoPro",
    subtitle: "Install & create",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+₹1.75",
    sections: [],
    device: "ios",
    duration: "2 Hrs",
  },
  {
    id: "3",
    name: "MegaGame",
    subtitle: "Play to win",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+₹5.00",
    sections: [],
    device: "android",
    duration: "1.5 Hrs",
  },
  {
    id: "4",
    name: "PhotoPro",
    subtitle: "Install & create",
    logo: "/src/ui/assets/shareMarket.webp",
    earn: "+₹1.75",
    sections: [],
    device: "ios",
    duration: "2 Hrs",
  },
];

// Attach runtime-only `status` property for demo filtering
export const sampleOffersWithStatus = sampleOffers.map(
  (s, i) =>
    ({
      ...s,
      status: i % 3 === 0 ? "progress" : i % 3 === 1 ? "completed" : "failed",
    }) as OfferModel & { status: string },
);

export default sampleOffersWithStatus;
