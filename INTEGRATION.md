# GrowBolt Web SDK — Integration Guide

The GrowBolt Web SDK is a lightweight, framework-agnostic script designed to easily add GrowBolt monetization features and offerwalls to your website or web application.

---

## Requirements
* Modern browser with ES2020+ support
* Fetch API support
* Browser cookie storage enabled

## Installation

### CDN (recommended)
Add the script tag to your main layout or HTML page.

```html
<script src="https://sdk.growbolt.ai/sdk.js" defer></script>
```

---

## Integration

### Step 1 — Initialise the SDK (once, on page load)
Call this once, as early as possible — it is safe to call before the user has logged in. `sub4` (user ID) is optional at this point; pass it later via `identify()` once you know who the user is.

```javascript
await window.GrowBolt.init({
  apiKey: "YOUR_SDK_TOKEN",  // Get your SDK token from the GrowBolt Dashboard
});
```

> [!WARNING]
> Passing `sub4` inside the `init()` configuration object is deprecated. Please use `GrowBolt.identify({ sub4 })` to manage identified users instead.

---

### Step 2 — Identify the user after login
As soon as your login flow has a stable identifier for the user (database user ID, email, username — whatever you use), call:

```javascript
window.GrowBolt.identify({
  sub4: "USER_UNIQUE_ID"
});
```

This can be called at any time after `init()`, from any page or module. The SDK stores and persists user identifiers inside a secure cookie (`growbolt_user`) across page refreshes.

Once a user is identified, all outgoing backend API requests, offer clicks, and the offerwall window will automatically carry the `sub4` parameters.

---

### Step 3 — Reset on logout
```javascript
window.GrowBolt.reset();
```

Clears the stored `sub4` user state and deletes the persisted `growbolt_user` cookie without tearing down the rest of the SDK. There is no need to call `init()` again for the next user, just call `identify()` once they log in.

---

### Step 4 — Register callback
```javascript
// Register event listeners to handle offerwall lifecycle and conversions
const unsubscribeOpen = window.GrowBolt.on("widget_opened", () => {
  // Handle offerwall loaded/opened
});

window.GrowBolt.on("widget_closed", () => {
  // Handle offerwall closed
});

window.GrowBolt.on("offer_click", ({ offerId, title, url }) => {
  // Credit or track user in your system
});
```

---

### Step 5 — Show the offerwall
```javascript
window.GrowBolt.openOfferwall();
```

---

### Step 6 — Unregister callbacks / Destroy
To clean up individual listeners or completely tear down the SDK session on page transition:

```javascript
// Unsubscribe from a specific event
unsubscribeOpen();

// Completely tear down and clean up SDK memory
await window.GrowBolt.destroy();
```

---

## API Reference

| Method | Description |
| :--- | :--- |
| `GrowBolt.init({ apiKey })` | Initialise SDK. Call once, safe before login (sub4 optional). |
| `GrowBolt.identify({ sub4 })` | Attach/update the user identifier after login. Call any time after init(). |
| `GrowBolt.reset()` | Clear the current sub4 user identifier on logout. SDK stays initialised. |
| `GrowBolt.openOfferwall()` | Open the offerwall overlay widget. |
| `GrowBolt.closeOfferwall()` | Close the offerwall overlay widget. |
| `GrowBolt.on(event, cb)` | Register event callback (returns unsubscribe function). |
| `GrowBolt.off(event, cb)` | Clear callback manually. |
| `GrowBolt.destroy()` | Completely tear down SDK instance and clear resources. |
| **Getter:** `GrowBolt.user` | Retrieve current identified user object (`{ sub4: string }` or `null`). |
| **Getter:** `GrowBolt.sub4` | Retrieve current identified `sub4` string or `null`. |

---

## Screens

| Screen | Description |
| :--- | :--- |
| **Offerwall** | Banner carousel + category chips + offer list |
| **Offer Detail** | Full offer info + CTA button with `sub4` dynamic tracking injected |
| **Offer Status** | Pending / Completed / Failed progress tabs with status counts |
| **Empty State** | "Explore Offer" status with navigation actions back to the main catalog |

---

## License
MIT
