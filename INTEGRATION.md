# GrowBolt Web SDK — Integration Guide

The GrowBolt Web SDK is **framework-agnostic**. It is not an npm React/Angular/Vue package. You load one script (`dist/sdk.js`), call `window.GrowBolt`, and it works the same on:

- Plain HTML / static sites  
- WordPress, Webflow, Shopify themes  
- React, Next.js, Angular, Vue, Svelte  
- Any CMS or backend that can output a `<script>` tag  

React is used **inside** the SDK bundle to render the offerwall UI. Your app does **not** install React or any GrowBolt UI dependencies.

Styles are injected automatically when the offerwall opens — **do not** add a separate CSS file.

---

## Where to put your API key

Provide the key **once**, in your host application, when you call init:

```javascript
await GrowBolt.init({
  apiKey: "YOUR_SDK_TOKEN_FROM_GROWBOLT_DASHBOARD",
});
```

| Environment | Where to set it |
|-------------|-----------------|
| **Your production site** | Your app bootstrap (e.g. main JS, theme `functions.php` inline script, CMS custom code) — **never** commit real keys to public repos |
| **This repo’s demo** | `demo/app.js` → `apiKey` in `GrowBolt.init()` |
| **SDK dev playground** | `growbolt-web-sdk/playground/app.js` |
| **Not in SDK source** | Do not edit files under `growbolt-web-sdk/src/` for keys |

The SDK does not read API keys from environment variables at runtime in the browser. The **host page** passes the key to `init()`.

---

## Installation

### 1. Host the bundle

Use the built file from `growbolt-web-sdk/dist/sdk.js` (CDN, S3, or your static assets).

### 2. Load the script

```html
<script src="https://your-cdn.example.com/sdk.js"></script>
```

Local demo:

```html
<script src="../growbolt-web-sdk/dist/sdk.js"></script>
```

### 3. Optional: API host override (local backend)

Only if you are **not** using the production API:

```html
<script>
  window.GROWBOLT_API_BASE_URL = "http://localhost";
</script>
<script src="./dist/sdk.js"></script>
```

Production integrators normally omit this — the SDK defaults to `https://admin.growbolt.ai`.

---

## Initialization (all platforms)

```javascript
await GrowBolt.init({
  apiKey: "YOUR_SDK_TOKEN",
});
```

| Option | Required | Description |
|--------|----------|-------------|
| `apiKey` | Yes | SDK token from GrowBolt dashboard |
| `baseUrl` | No | Rare override for API origin |
| `apiKeyScheme` | No | Default: `SdkToken` |
| `sub4` / `userId` | No | Attribution on claim URLs |
| `debug` | No | Verbose logging |

After init, use `GrowBolt.openOfferwall()`, `listOffers()`, etc. — no extra config.

---

## Vanilla JavaScript (HTML)

```html
<button id="openRewards">Open Rewards</button>

<script src="./dist/sdk.js"></script>
<script>
  (async function () {
    await GrowBolt.init({ apiKey: "YOUR_SDK_TOKEN" });
    document.getElementById("openRewards").onclick = function () {
      GrowBolt.openOfferwall();
    };
  })();
</script>
```

### Button, card, or image

```html
<button data-growbolt-offerwall>Open Rewards</button>
```

```javascript
document.querySelectorAll("[data-growbolt-offerwall]").forEach(function (el) {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    GrowBolt.openOfferwall();
  });
});
```

---

## Using with any framework

Same pattern everywhere:

1. Load `sdk.js` in the page (or root HTML).  
2. Call `GrowBolt.init({ apiKey })` once when the app starts.  
3. Call `GrowBolt.openOfferwall()` from a click handler.

You do **not** import GrowBolt components into React/Angular/etc. The offerwall is a self-contained overlay.

### Next.js / React

Load the script in `app/layout.tsx` or `public/index.html`:

```html
<script src="/sdk.js" defer></script>
```

```javascript
// Client component or useEffect — runs once
useEffect(() => {
  window.GrowBolt?.init({ apiKey: process.env.NEXT_PUBLIC_GROWBOLT_KEY });
}, []);
```

```jsx
<button type="button" onClick={() => window.GrowBolt?.openOfferwall()}>
  Rewards
</button>
```

Use `NEXT_PUBLIC_*` env vars for the key; do not hardcode in client bundles for production.

### Angular

`angular.json` → add `sdk.js` to `scripts`, or inject in `index.html`.

```typescript
declare global {
  interface Window {
    GrowBolt?: {
      init(cfg: { apiKey: string }): Promise<unknown>;
      openOfferwall(): void;
    };
  }
}

// app.component.ts ngOnInit
await window.GrowBolt?.init({ apiKey: environment.growboltApiKey });
```

```html
<button type="button" (click)="window.GrowBolt?.openOfferwall()">Rewards</button>
```

### Vue / Nuxt

`index.html` or `nuxt.config` script tag, then in `onMounted`:

```javascript
await window.GrowBolt.init({ apiKey: useRuntimeConfig().public.growboltApiKey });
```

### WordPress / PHP

Enqueue script and pass key from options (not in theme source control):

```php
wp_enqueue_script('growbolt-sdk', 'https://cdn.example.com/sdk.js', [], null, true);
wp_add_inline_script('growbolt-sdk', sprintf(
  'GrowBolt.init({ apiKey: %s }).catch(console.error);',
  wp_json_encode(get_option('growbolt_api_key'))
), 'after');
```

```html
<button type="button" onclick="GrowBolt.openOfferwall()">Rewards</button>
```

### Shopify / static CMS

Theme → **Edit code** → add `<script src="...">` and a small snippet that calls `init` with the key from theme settings.

---

## API reference

| Method | Description |
|--------|-------------|
| `init({ apiKey })` | Initialize (required once) |
| `destroy()` | Tear down |
| `openOfferwall()` | Open offerwall overlay |
| `closeOfferwall()` | Close overlay |
| `listOffers({ search, os, category, tag, forceRefresh })` | Fetch offers |
| `getOfferDetails(offerId)` | Offer details |
| `redeemOffer(offerId)` | Redeem / attribution |
| `getOngoing({ sub4, tab })` | Progress tabs |
| `on(event, handler)` | Subscribe |
| `emit(event, payload)` | Emit |

### Events

- `sdk_initialized`, `sdk_destroyed`  
- `widget_opened`, `widget_closed`  
- `offer_click` — `{ offerId, title, url }`

---

## Claim flow

1. User taps **Claim**.  
2. SDK calls `redeemOffer(offerId)`.  
3. Modal shows **QR code** + **Open Link** (attribution preserved).

---

## Build SDK from source

```bash
cd growbolt-web-sdk
npm install
VITE_API_BASE_URL=http://localhost npm run build   # local API
# or
npm run build   # production API host (default)
```

Output: `dist/sdk.js` (single file, styles included).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Unstyled UI | Rebuild SDK; load latest `sdk.js` only (no extra CSS) |
| SDK not initialized | Call `init({ apiKey })` before `openOfferwall()` |
| 401 errors | Check API key in dashboard |
| Wrong API host | Set `GROWBOLT_API_BASE_URL` before script, or rebuild with `VITE_API_BASE_URL` |
| Framework “can’t find module” | Do not `npm install growbolt` for UI — use script + `window.GrowBolt` |

---

## Best practices

1. **One `init()` per page load** with a single API key.  
2. **Never** embed keys in the SDK repo — only in your app config / CMS settings.  
3. Load `sdk.js` **before** calling `init` (or use `defer` + wait for `load`).  
4. Use **`offer_click`** for analytics.  
5. Works on **any stack** — integration is always script + global API.

---

## Demo in this monorepo

```bash
cd growbolt-web-sdk && VITE_API_BASE_URL=http://localhost npm run build
cd ../demo && npx serve .
```

API key for local demo: **`demo/app.js`** → `GrowBolt.init({ apiKey: "..." })`.
