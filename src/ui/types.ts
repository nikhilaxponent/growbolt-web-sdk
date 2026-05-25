export interface OfferModel {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  subtitle?: string;
  earn?: string;
  sections?: any[];
}

export type Layout = "grid" | "list" | "compact-scroll";
