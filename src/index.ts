import { SDK } from "./core/SDK";
import type { GrowBoltSDK } from "./types/sdk";

// Create and expose singleton instance
const instance: GrowBoltSDK = new SDK();

// Attach to globalThis for IIFE/browser contexts
(globalThis as any).GrowBolt = instance;

export default instance;
