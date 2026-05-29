export interface OfferModel {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  subtitle?: string;
  earn?: string;
  device?: "android" | "ios";
  duration?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections?: any[];
}

export type Layout = "grid" | "list" | "compact-scroll";
