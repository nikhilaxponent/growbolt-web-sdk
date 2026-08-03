---
name: sdk-architecture
description: Renderer pattern, SDKContext DI, Phase 1 refactor decisions for GrowBolt Web SDK
metadata:
  type: project
---

Phase 1 refactor (2026-08) introduced Renderer abstraction and React dependency injection.

**Key new files:**
- `src/types/service.ts` — `SDKService` interface (subset of `GrowBoltSDK` that UI needs)
- `src/ui/context/SDKContext.tsx` — React context holding `SDKService | null`
- `src/ui/hooks/useSDK.ts` — `useSDK()` hook; throws if no provider
- `src/renderers/RendererInterface.ts` — `Renderer` contract for Phase 2
- `src/renderers/inline/InlineRenderer.ts` — wraps React tree in `SDKContext.Provider`; extracted from widget.ts

**Call chain:**
`SDK.openOfferwall(opts, this)` → `widget.openOfferwall(opts, service)` → `InlineRenderer.open(service, opts)` → renders `<SDKContext.Provider value={service}><SDKLauncher/></SDKContext.Provider>`

**Why:** All 6 React components (`SDKLauncher`, `SDKModalPage`, `SDKDetailsPage`, `ProgressPage`, `OfferCard`, `SDKFilterBar`) were calling `window.GrowBolt` directly, which would break inside an iframe (different window).

**`sdkState.apiClient` fix:** Changed from `any` to `ApiClient | undefined`. All 5 `(sdkState as any).apiClient` casts in `SDK.ts` are removed. Missing apiClient is now a compile-time error, not a silent runtime undefined.

**Phase 2 readiness:** `IframeRenderer` implements `Renderer`, passes a `postMessage` proxy as `SDKService`. Components are already context-aware; no UI changes needed.

**Dev server:** `App.tsx` wraps `SDKLauncher` in `SDKContext.Provider` with `window.GrowBolt` as the value so `npm run dev` still works.

**Why:** Build to `dist/sdk.js` — zero behavior change verified by same bundle size (2,454.77 kB) and zero tsc errors.
