# GrowBolt Web SDK

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/growbolt/web-sdk)
[![Bundle Size](https://img.shields.io/badge/size-7.0%20KB%20gzip-blue)](https://github.com/growbolt/web-sdk)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

A lightweight, production-grade Web SDK for publishers integrating GrowBolt monetization features. Built with TypeScript, Vite, and zero external dependencies.

**Features:**
- 📦 **7KB Gzipped** - Minimal bundle size for fast loading
- 🔒 **Secure** - Cookie-based storage, no localStorage, SameSite protection
- 📝 **Type-Safe** - Full TypeScript support with exported types
- 🎯 **Event-Driven** - Custom emitter pattern for flexible event handling
- 🚀 **Production-Ready** - Error handling, validation, logging, and monitoring built-in
- 👤 **User Identification & Persistence** - Seamless user mapping and cookie-based persistent sessions

---

## Quick Start

### 1. Add Script to Your HTML

```html
<script src="https://sdk.growbolt.ai/sdk.js" defer></script>
```

### 2. Initialize the SDK
Initialize the SDK once, as early as possible. It is safe to call before the user has logged in.

```javascript
await window.GrowBolt.init({
  apiKey: 'YOUR_SDK_TOKEN', // Get your token from the dashboard
});
```

> [!WARNING]
> Passing `sub4` inside the `init()` configuration object is deprecated. Use `GrowBolt.identify({ sub4 })` once the user logs in.

### 3. Identify Your Users
Associate conversions and clicks to specific users in your system:

```javascript
window.GrowBolt.identify({
  sub4: 'USER_UNIQUE_ID'
});
```

Identified users are persisted inside a secure cookie (`growbolt_user`) across page refreshes.

### 4. Show the Offerwall

```javascript
window.GrowBolt.openOfferwall();
```

### 5. Listen for Events

```javascript
window.GrowBolt.on('widget_opened', () => {
  console.log('User opened offerwall');
});

window.GrowBolt.on('widget_closed', () => {
  console.log('User closed offerwall');
});
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [INTEGRATION.md](INTEGRATION.md) | Client-side integration steps & framework examples |
| [SDK.md](SDK.md) | Complete API reference and usage examples |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, data flow, and internals |
| [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) | Backend endpoint implementation |

---

## API Overview

### Initialization
```typescript
// Initialize the SDK
await window.GrowBolt.init({
  apiKey: string,        // Required: min 8 chars
  baseUrl?: string,      // Optional: backend URL override
  timeout?: number       // Optional: request timeout (ms)
});
```

### User Identification
```typescript
// Attach/update the user identifier after login
window.GrowBolt.identify({
  sub4: string
});

// Clear current user identifier and persisted cookies on logout
window.GrowBolt.reset();

// Retrieve currently identified user details (Getters)
const user = window.GrowBolt.user; // { sub4: string } or null
const sub4 = window.GrowBolt.sub4; // string or null
```

### Widget Control
```typescript
// Open offerwall overlay
window.GrowBolt.openOfferwall({ url?: string });

// Close offerwall overlay
window.GrowBolt.closeOfferwall();
```

### Event System
```typescript
// Subscribe to event
const unsubscribe = window.GrowBolt.on(eventType, listener);

// Unsubscribe
window.GrowBolt.off(eventType, listener);

// Manual emit
window.GrowBolt.emit(eventType, payload);

// Supported events:
// - 'sdk_initialized'
// - 'sdk_destroyed'
// - 'widget_opened'
// - 'widget_closed'
// - 'offer_click'
```

---

## Local Development & Testing Setup

### 1. Developer Setup
Install local development packages and type definitions:
```bash
npm install
```

### 2. Building the SDK
Bundle the TypeScript code into a single minified bundle:
```bash
# Build targeting the production host (https://admin.growbolt.ai)
npm run build

# Build targeting a local backend API (e.g., http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000 npm run build
```

### 3. Testing in the Playground
Interact with the SDK locally in the playground:
```bash
# Build and copy the SDK to the playground directory
npm run build:playground

# Run a local HTTP server
npm run serve:playground
```
Open `http://localhost:5000` (or the port specified by the CLI) to test the interactive playground.

### 4. Testing inside Local Demo Websites (e.g. `demo`, `demo2`)
Embed and verify the SDK inside host applications:
1. Build the SDK pointing to the local API: `VITE_API_BASE_URL=http://localhost:8000 npm run build`
2. Reference the local build in the demo HTML:
   ```html
   <script src="../growbolt-web-sdk/dist/sdk.js"></script>
   ```
3. Run a static server inside the demo folder:
   ```bash
   cd ../demo
   npx serve .
   ```
---

## Troubleshooting

### SDK Not Found
**Problem:** `window.GrowBolt is undefined`
* Check the script URL is correct and accessible.
* Verify script tag is placed before accessing the object.
* Ensure you wait for `DOMContentLoaded` if needed.

### Init Fails
**Problem:** `GrowBolt.init() throws error`
* Verify your `apiKey` is valid (minimum 8 characters).
* Check that backend endpoints are accessible.
* Verify CORS headers permit requests from your domain.

---

## License & Support
MIT © 2026 GrowBolt

* **Documentation**: https://docs.growbolt.com
* **Email**: support@growbolt.com
* **Issues**: https://github.com/growbolt/web-sdk/issues
