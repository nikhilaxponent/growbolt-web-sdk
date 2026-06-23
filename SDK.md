# GrowBolt Web SDK - Complete Documentation

## Overview

GrowBolt is a lightweight, production-grade Web SDK for publishers integrating monetization features into their web applications. Built with TypeScript and Vite, it provides a secure, type-safe interface for managing publisher identity, session management, offerwall display, and event tracking.

**Key Features:**

- 📦 **Lightweight**: 7KB gzipped IIFE bundle with zero external dependencies
- 🔒 **Secure**: Cookie-based storage with SameSite=Lax, no localStorage usage
- 📝 **Type-Safe**: Full TypeScript support with exported type definitions
- 🎯 **Event-Driven**: Custom emitter pattern for flexible event handling
- 🚀 **Production-Ready**: Comprehensive error handling, validation, and logging

---

## Quick Start

### 1. Installation

Include the SDK in your HTML file:

```html
<script src="https://sdk.growbolt.ai/sdk.js"></script>
```

The SDK automatically exposes itself on `window.GrowBolt`.

### 2. Initialize the SDK

```javascript
// Basic initialization
await window.GrowBolt.init({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.growbolt.com',
  timeout: 10000
});

// Listen for initialization event
window.GrowBolt.on('sdk_initialized', (event) => {
  console.log('SDK initialized with session:', event.session);
  console.log('Publisher config:', event.publisherConfig);
});
```

### 3. Display Offerwall

```javascript
// Open offerwall with SDK config URL
window.GrowBolt.openOfferwall();

// Or open with custom URL
window.GrowBolt.openOfferwall({
  url: 'https://myofferwall.example.com'
});

// Listen for widget events
window.GrowBolt.on('widget_opened', () => console.log('Offerwall opened'));
window.GrowBolt.on('widget_closed', () => console.log('Offerwall closed'));
```

### 4. Cleanup

```javascript
// Destroy SDK and clean up resources
await window.GrowBolt.destroy();

// Listen for destroy event
window.GrowBolt.on('sdk_destroyed', () => console.log('SDK cleaned up'));
```

---

## API Reference

### Initialization

#### `init(config?: SDKConfig): Promise<InitResponse>`

Initializes the SDK with publisher configuration.

**Parameters:**

```typescript
interface SDKConfig {
  apiKey: string;              // Required: min 8 characters
  baseUrl?: string;            // Optional: backend base URL
  offerwallUrl?: string;       // Optional: default offerwall URL
  timeout?: number;            // Optional: request timeout in ms (default 10000)
}
```

**Returns:**

```typescript
interface InitResponse {
  ok: boolean;
  session: Session;
  publisherConfig?: PublisherConfig;
}
```

**Errors:**

- Throws `Error` if `apiKey` is missing
- Throws `ValidationError` if config is invalid
- Logs warning if backend call fails (continues offline mode)

**Example:**

```javascript
try {
  const response = await window.GrowBolt.init({
    apiKey: 'pk_test_abc123def456',
    baseUrl: 'https://api.example.com',
    timeout: 15000
  });
  console.log('Session ID:', response.session.sessionId);
} catch (error) {
  console.error('Initialization failed:', error.message);
}
```

---

### Lifecycle Management

#### `destroy(): Promise<{ok: boolean}>`

Destroys the SDK, cleans up resources, and clears session.

**Behavior:**

1. Closes any open modals
2. Clears session storage (cookies)
3. Resets internal state
4. Emits `sdk_destroyed` event

**Example:**

```javascript
await window.GrowBolt.destroy();
```

---

### Widget Control

#### `openOfferwall(opts?: {url?: string}): void`

Opens the offerwall modal overlay.

**Parameters:**

```typescript
interface OfferwallOptions {
  url?: string;  // Custom offerwall URL (overrides config)
}
```

**Behavior:**

- Creates fixed 900x600px modal with iframe
- Emits `widget_opened` event
- No-op if SDK not initialized

**Example:**

```javascript
window.GrowBolt.openOfferwall({
  url: 'https://offers.example.com/publisher/123'
});
```

#### `closeOfferwall(): void`

Closes the currently open offerwall modal.

**Behavior:**

- Removes modal from DOM
- Emits `widget_closed` event
- No-op if no modal is open

**Example:**

```javascript
window.GrowBolt.closeOfferwall();
```

---

### Event System

#### `on(event: SDKEventType, listener: (payload: any) => void): () => void`

Subscribes to SDK events.

**Supported Events:**

- `sdk_initialized` - SDK initialized successfully
- `sdk_destroyed` - SDK destroyed/cleaned up
- `widget_opened` - Offerwall modal opened
- `widget_closed` - Offerwall modal closed

**Returns:** Unsubscribe function to remove listener

**Example:**

```javascript
const unsubscribe = window.GrowBolt.on('sdk_initialized', (event) => {
  console.log('Initialized!');
});

// Later, remove listener
unsubscribe();
```

#### `off(event: SDKEventType, listener?: (payload: any) => void): void`

Unsubscribes from SDK events.

**Parameters:**

- `event` - Event name
- `listener` - Specific listener to remove (optional - removes all if omitted)

**Example:**

```javascript
const handler = (event) => console.log('Widget closed');
window.GrowBolt.on('widget_closed', handler);

// Remove specific listener
window.GrowBolt.off('widget_closed', handler);

// Remove all listeners for event
window.GrowBolt.off('widget_closed');
```

#### `emit(event: SDKEventType, payload?: any): void`

Manually emits an event (for advanced use cases).

**Example:**

```javascript
window.GrowBolt.emit('custom_event', { data: 'value' });
```

---

### Ready State

#### `ready(): Promise<InitResponse>`

Returns a promise that resolves when SDK is initialized, or rejects after 30 seconds timeout.

**Useful for:** Waiting for async initialization completion.

**Example:**

```javascript
// Start initialization without awaiting
window.GrowBolt.init({ apiKey: 'pk_test_123' });

// Later, wait for initialization to complete
try {
  const response = await window.GrowBolt.ready();
  console.log('SDK ready!', response.session);
} catch (error) {
  console.error('SDK initialization timeout');
}
```

---

## Event Payload Examples

### `sdk_initialized`

```javascript
{
  session: {
    sessionId: 'uuid-v4-format',
    startedAt: 1621234567890
  },
  publisherConfig: {
    // Publisher configuration from backend (if available)
  }
}
```

### `widget_opened`

```javascript
{
  url: 'https://offerwall.example.com'
}
```

### `widget_closed`

```javascript
// No payload
```

### `sdk_destroyed`

```javascript
// No payload
```

---

## Error Handling

The SDK provides custom error classes for granular error handling:

```javascript
try {
  await window.GrowBolt.init(config);
} catch (error) {
  if (error instanceof window.GrowBolt.ValidationError) {
    console.error('Config validation failed:', error.message);
  } else if (error instanceof window.GrowBolt.APIError) {
    console.error('Backend error:', error.status, error.data);
  } else if (error instanceof window.GrowBolt.TimeoutError) {
    console.error('Request timeout');
  } else {
    console.error('Unknown error:', error);
  }
}
```

**Error Classes:**

- `SDKError` - Base error class (all SDK errors extend this)
- `ValidationError` - Configuration or input validation failed
- `APIError` - Backend API call failed (includes `status` and `data` properties)
- `TimeoutError` - Request exceeded timeout

---

## Storage & Security

### Session Storage (Cookies)

The SDK stores session data in browser cookies with the following properties:

```
Name:         growbolt_session
Value:        JSON-encoded {sessionId, startedAt}
Path:         /
Max-Age:      604800 (7 days)
SameSite:     Lax
Secure:       Recommended (set by backend if HTTPS)
HttpOnly:     Not set (SDK needs read access)
```

**Important:** For truly sensitive tokens (authentication, payment data), use HttpOnly cookies set by your backend.

### No localStorage

The SDK intentionally avoids `localStorage` to reduce XSS vulnerability surface. All data is cookie-based with secure defaults.

---

## Backend Integration

### Required Backend Endpoint

The SDK expects your backend to expose a POST endpoint:

**Endpoint:** `POST /sdk/init` (or custom path via config)

**Request Body:**

```json
{
  "apiKey": "pk_test_abc123",
  "sessionId": "uuid-v4-format"
}
```

**Expected Response:**

```json
{
  "ok": true,
  "publisherConfig": {
    "offerwallUrl": "https://offerwall.example.com",
    "widgetSettings": {
      "width": 900,
      "height": 600
    }
  }
}
```

**CORS Requirements:**

```http
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://your-publisher-domain.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Backend Session Validation

When handling SDK requests, your backend should:

1. **Validate API Key:**

   ```javascript
   if (!apiKey.startsWith('pk_') || apiKey.length < 8) {
     return { error: 'Invalid API key' };
   }
   ```

2. **Create/Restore Session:**

   ```javascript
   // Option A: Use sessionId from SDK
   // Option B: Set HttpOnly cookie for sensitive tokens
   res.cookie('auth_token', secureToken, {
     httpOnly: true,
     secure: true,
     sameSite: 'Lax',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });
   ```

3. **Return Publisher Config:**

   ```javascript
   return {
     ok: true,
     publisherConfig: {
       offerwallUrl: `https://offers.example.com/pub/${publisherId}`,
       widgetSettings: { /* ... */ }
     }
   };
   ```

---

## Integration Examples

### Complete Example: Game Publisher

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game - Earn Rewards</title>
  <style>
    #earnBtn { padding: 10px 20px; font-size: 16px; }
    #status { margin-top: 10px; }
  </style>
</head>
<body>
  <h1>My Awesome Game</h1>
  <button id="earnBtn">Watch Ads & Earn</button>
  <div id="status"></div>

  <script src="https://sdk.growbolt.ai/sdk.js"></script>
  <script>
    const statusEl = document.getElementById('status');
    
    // Initialize on page load
    window.GrowBolt.init({
      apiKey: 'pk_live_your_key_here',
      baseUrl: 'https://api.yourgame.com'
    }).then(() => {
      statusEl.textContent = 'Ready to earn!';
    }).catch(err => {
      statusEl.textContent = 'Initialization failed: ' + err.message;
    });

    // Listen for events
    window.GrowBolt.on('widget_opened', () => {
      console.log('User opened offerwall');
    });

    window.GrowBolt.on('widget_closed', () => {
      console.log('User closed offerwall');
    });

    // Show offerwall on button click
    document.getElementById('earnBtn').addEventListener('click', () => {
      window.GrowBolt.openOfferwall();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      window.GrowBolt.destroy();
    });
  </script>
</body>
</html>
```

### Deferred Initialization

```javascript
// Start SDK initialization but don't wait
window.GrowBolt.init({
  apiKey: 'pk_test_123',
  baseUrl: 'https://api.example.com'
});

// Continue with page load immediately
console.log('Page loaded');

// Later, when user wants to use offerwall
async function showOfferwall() {
  try {
    // Wait for initialization to complete (max 30s)
    await window.GrowBolt.ready();
    window.GrowBolt.openOfferwall();
  } catch (error) {
    console.error('SDK not ready:', error);
  }
}
```

### Custom Event Tracking

```javascript
// Attach listeners for custom analytics
window.GrowBolt.on('sdk_initialized', (event) => {
  // Track SDK initialization in your analytics
  gtag('event', 'sdk_initialized', {
    session_id: event.session.sessionId,
    timestamp: event.session.startedAt
  });
});

window.GrowBolt.on('widget_opened', () => {
  gtag('event', 'offerwall_opened');
});

window.GrowBolt.on('widget_closed', () => {
  gtag('event', 'offerwall_closed');
});
```

---

## Browser Support

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (10+)
- Edge: ✅ Full support
- Internet Explorer: ❌ Not supported

**Requirements:**

- ES2020+ JavaScript support
- Fetch API support
- Cookies enabled
- DOM access

---

## Performance

- **Bundle Size**: 7 KB gzipped
- **Load Time**: < 100ms on 3G
- **Initialization**: Async, non-blocking
- **Memory**: ~50KB runtime footprint

---

## Security Best Practices

1. **Always use HTTPS** for production deployments
2. **Set Secure flag** on cookies via backend (use `Secure` attribute)
3. **Validate API keys** on your backend
4. **Use rate limiting** on SDK initialization endpoint
5. **Implement CORS** properly - only allow your publisher domains
6. **Monitor for XSS** - implement Content Security Policy headers
7. **Rotate API keys** periodically
8. **Log SDK events** for fraud detection

---

## Troubleshooting

### SDK Not Loading

**Problem:** `window.GrowBolt is undefined`

**Solutions:**

1. Check that `<script>` tag loads successfully (check Network tab)
2. Wait for `DOMContentLoaded` before accessing SDK
3. Verify SDK URL is correct and accessible

```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (window.GrowBolt) {
    window.GrowBolt.init({ /* ... */ });
  }
});
```

### Initialization Fails

**Problem:** `GrowBolt.init() throws error`

**Solutions:**

1. Verify `apiKey` is provided and valid (min 8 chars)
2. Check backend `/sdk/init` endpoint is accessible
3. Verify CORS headers if cross-domain request
4. Check browser console for detailed error message

```javascript
try {
  await window.GrowBolt.init(config);
} catch (err) {
  console.error('Init failed:', err.message);
  console.error('Full error:', err);
}
```

### Offerwall Not Displaying

**Problem:** Modal appears blank or doesn't load

**Solutions:**

1. Verify `offerwallUrl` is correct and returns valid content
2. Check iframe sandbox attributes don't block resources
3. Verify offerwall domain doesn't have X-Frame-Options blocking
4. Check browser console for iframe errors

---

## License

© 2025 GrowBolt. All rights reserved.

---

## Support

For issues, questions, or feature requests:

- **Documentation**: https://docs.growbolt.com
- **Email**: support@growbolt.com
- **GitHub Issues**: https://github.com/growbolt/web-sdk
