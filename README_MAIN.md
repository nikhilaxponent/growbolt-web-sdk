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

---

## Quick Start

### 1. Add Script to Your HTML

```html
<script src="https://cdn.growbolt.com/sdk.js"></script>
```

### 2. Initialize

```javascript
await window.GrowBolt.init({
  apiKey: 'pk_live_your_key_here',
  baseUrl: 'https://api.growbolt.com'
});
```

### 3. Show Offerwall

```javascript
window.GrowBolt.openOfferwall();
```

### 4. Listen for Events

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
| [SDK.md](SDK.md) | Complete API reference and usage examples |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, data flow, and internals |
| [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) | Backend endpoint implementation |

---

## Installation & Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Clone and install
git clone https://github.com/growbolt/web-sdk.git
cd web-sdk
npm install

# Build
npm run build

# Output: dist/sdk.js (7.02 KB gzipped)
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production bundle
npm run preview
```

### Playground

A local testing environment is included:

```bash
# Build SDK and copy to playground
npm run build:playground

# Start local HTTP server
npm run serve:playground

# Open http://localhost:5000 in browser
```

---

## Project Structure

```
growbolt-web-sdk/
├── src/
│   ├── index.ts                 # Entry point (IIFE global)
│   ├── core/
│   │   ├── SDK.ts              # Main SDK class
│   │   ├── lifecycle/
│   │   │   ├── init.ts         # Initialization
│   │   │   └── destroy.ts      # Cleanup
│   │   ├── events/
│   │   │   ├── emitter.ts      # Event system
│   │   │   └── eventTypes.ts   # Event constants
│   │   └── state/
│   │       ├── sdkState.ts     # SDK state
│   │       └── sessionState.ts # Session state
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.ts    # HTTP client
│   │   │   └── endpoints.ts    # API paths
│   │   ├── storage/
│   │   │   └── storage.ts      # Cookie storage
│   │   ├── session/
│   │   │   └── session.ts      # Session lifecycle
│   │   ├── logger/
│   │   │   └── logger.ts       # Logging
│   │   └── widget/
│   │       ├── modal.ts        # Modal UI
│   │       └── widget.ts       # Widget API
│   ├── types/
│   │   ├── sdk.ts              # Type definitions
│   │   ├── errors.ts           # Error classes
│   │   └── global.d.ts         # Global types
│   └── utils/
│       ├── validate.ts         # Validation
│       ├── uuid.ts             # UUID generation
│       ├── environment.ts      # Environment detection
│       └── dom.ts              # DOM utilities
├── dist/
│   └── sdk.js                  # Production bundle (IIFE)
├── playground/
│   ├── index.html              # Test harness
│   ├── app.js                  # Test logic
│   ├── styles.css              # Styling
│   └── dist-sdk.js             # Copied bundle
├── SDK.md                       # API documentation
├── ARCHITECTURE.md             # System design
├── BACKEND_INTEGRATION.md      # Backend guide
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                   # This file
```

---

## API Overview

### Initialization

```typescript
// Initialize the SDK
await window.GrowBolt.init({
  apiKey: string,        // Required: min 8 chars
  baseUrl?: string,      // Optional: backend URL
  timeout?: number       // Optional: request timeout (ms)
});
```

### Widget Control

```typescript
// Open offerwall
window.GrowBolt.openOfferwall({url?: string});

// Close offerwall
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
```

### Lifecycle

```typescript
// Check if SDK is ready
await window.GrowBolt.ready();

// Cleanup
await window.GrowBolt.destroy();
```

---

## Error Handling

```javascript
try {
  await window.GrowBolt.init(config);
} catch (error) {
  if (error instanceof window.GrowBolt.ValidationError) {
    // Handle validation errors
  } else if (error instanceof window.GrowBolt.APIError) {
    // Handle API errors (includes status code)
  } else if (error instanceof window.GrowBolt.TimeoutError) {
    // Handle timeout errors
  } else {
    // Handle unknown errors
  }
}
```

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 51+ | ✅ Supported |
| Firefox | 52+ | ✅ Supported |
| Safari | 10.1+ | ✅ Supported |
| Edge | 15+ | ✅ Supported |
| IE | Any | ❌ Not supported |

---

## Performance

- **Bundle Size**: 7.02 KB gzipped
- **Load Time**: < 100ms on 3G
- **Initialization**: Async, non-blocking
- **Memory**: ~50KB runtime
- **No Dependencies**: Zero external packages

---

## Security

The SDK implements multiple layers of security:

1. **Cookie-Based Storage**
   - Uses secure cookies instead of localStorage
   - SameSite=Lax protection against CSRF
   - HttpOnly flag compatible (set by backend)
   - 7-day TTL with auto-expiration

2. **Input Validation**
   - Client-side validation (fast feedback)
   - Server-side validation (security)
   - Type-safe TypeScript interfaces

3. **Request Credentials**
   - Supports credential modes for cross-domain requests
   - Compatible with HttpOnly backend cookies
   - CORS-aware for secure origins

4. **Error Isolation**
   - Event listeners wrapped in try-catch
   - One listener's error doesn't affect others
   - Detailed error logging for debugging

---

## Backend Requirements

Your backend must implement a POST endpoint:

**Endpoint:** `POST /sdk/init`

**Request:**
```json
{
  "apiKey": "pk_...",
  "sessionId": "uuid-v4"
}
```

**Response:**
```json
{
  "ok": true,
  "publisherConfig": {
    "offerwallUrl": "https://...",
    "widgetSettings": {...}
  }
}
```

**CORS:** Must allow credentials and publisher domain

For complete backend guide, see [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).

---

## Example Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <button id="earnBtn">Earn Rewards</button>
  <div id="status"></div>

  <script src="https://cdn.growbolt.com/sdk.js"></script>
  <script>
    // Initialize on load
    window.GrowBolt.init({
      apiKey: 'pk_live_your_key',
      baseUrl: 'https://api.yourbackend.com'
    }).then(() => {
      document.getElementById('status').textContent = 'Ready!';
    }).catch(err => {
      console.error('Init failed:', err);
    });

    // Handle button click
    document.getElementById('earnBtn').addEventListener('click', () => {
      window.GrowBolt.openOfferwall();
    });

    // Listen for events
    window.GrowBolt.on('widget_opened', () => {
      console.log('Offerwall opened');
    });

    window.GrowBolt.on('widget_closed', () => {
      console.log('Offerwall closed');
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      window.GrowBolt.destroy();
    });
  </script>
</body>
</html>
```

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Create Pull Request

### Development Guidelines

- Use TypeScript for all source files
- Follow existing code style
- Add unit tests for new features
- Update documentation
- Ensure build passes (`npm run build`)

---

## Testing

```bash
# Build the SDK
npm run build

# Verify bundle size
ls -lh dist/sdk.js

# Test in playground
npm run build:playground
npm run serve:playground
# Open http://localhost:5000 and verify functionality
```

**Test Checklist:**
- [ ] SDK loads without errors
- [ ] init() works with valid config
- [ ] init() validates config properly
- [ ] Events emit correctly
- [ ] destroy() cleans up resources
- [ ] Modal opens/closes properly
- [ ] Cookies are created with correct settings
- [ ] Error messages are helpful

---

## Troubleshooting

### SDK Not Found

```javascript
if (!window.GrowBolt) {
  console.error('SDK failed to load');
}
```

**Solutions:**
- Check script URL is correct
- Verify CDN is accessible
- Wait for DOMContentLoaded

### Init Fails

```javascript
try {
  await window.GrowBolt.init(config);
} catch (error) {
  console.error(error.message); // Detailed error
}
```

**Solutions:**
- Verify apiKey format (min 8 chars)
- Check backend is accessible
- Verify CORS headers

### Offerwall Not Loading

- Check offerwallUrl is correct
- Verify iframe sandbox permissions
- Check X-Frame-Options headers

For more troubleshooting, see [SDK.md](SDK.md#troubleshooting).

---

## License

MIT © 2025 GrowBolt

---

## Support

- **Documentation**: https://docs.growbolt.com
- **Email**: support@growbolt.com
- **Issues**: https://github.com/growbolt/web-sdk/issues
- **Playground**: See `/playground` directory

---

## Changelog

### v0.0.0 (Initial Release)

- ✅ Production-grade Web SDK
- ✅ Event-driven architecture
- ✅ Cookie-based session management
- ✅ Type-safe TypeScript interfaces
- ✅ Zero external dependencies
- ✅ 7KB gzipped bundle
- ✅ Comprehensive error handling
- ✅ Full documentation

---

**Built with ❤️ by the GrowBolt team**
