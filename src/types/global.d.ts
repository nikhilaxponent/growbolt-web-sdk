import type { GrowBoltSDK } from "./sdk";

declare global {
  interface Window {
    GrowBolt?: GrowBoltSDK;
  }
  var GrowBolt: GrowBoltSDK | undefined;
}
