import { SDK } from "./core/SDK";

declare global {
  interface Window {
    GrowBolt?: SDK;
  }
  // allow attaching to globalThis in non-window environments
  var GrowBolt: SDK | undefined;
}

// Create a single SDK instance and expose it on globalThis for maximum compatibility
const instance = new SDK();
(globalThis as any).GrowBolt = instance;

export default instance;
