# GrowBolt SDK - Architecture Guide

## System Overview

The GrowBolt Web SDK follows a **thin runtime layer** architecture pattern, optimized for lightweight deployment and maximum security.

```
┌─────────────────────────────────────────────────────────────┐
│                    Publisher HTML/App                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼ init({apiKey, baseUrl})
┌─────────────────────────────────────────────────────────────┐
│              window.GrowBolt (IIFE Bundle)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  SDK Class   │  │ Event Emitter│  │ State Management │   │
│  │              │  │              │  │                  │   │
│  │ • init()     │  │ • on()       │  │ • sdkState       │   │
│  │ • destroy()  │  │ • off()      │  │ • sessionState   │   │
│  │ • openOW()   │  │ • emit()     │  │                  │   │
│  │ • closeOW()  │  │              │  │                  │   │
│  │ • ready()    │  │              │  │                  │   │
│  └───────────────┘  └──────────────┘  └──────────────────┘  │
│           │                                                 │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │      Service Layer                                    │  │
│  ├─────────────────────────────────────────────────────┤ │  |
│  │ • SessionService      (createSession, restoreSession) │  │
│  │ • ApiClient           (fetch wrapper with credentials)│  │
│  │ • StorageService      (cookie-based persistence)      │  │
│  │ • Logger              (structured logging)            │  │
│  │ • ModalManager        (offerwall UI rendering)        │  │
│  └─────────────────────────────────────────────────────┘ │. |
│           │                                                 │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │      Utility Layer                                    │  │
│  ├─────────────────────────────────────────────────────┤ │. |
│  │ • Validation          (config, apiKey, URL)           │  │
│  │ • UUID Generation     (session IDs)                    │ │
│  │ • Environment Detection (browser, secure context)    │ │ |
│  │ • DOM Utilities       (element creation, CSS injection)│ │
│  └─────────────────────────────────────────────────────┘ │
│                                                              │
└───────────────────┬──────────────────────────────────────────┘
                    │
       ┌────────────┴───────────────┐
       ▼                             ▼
  Backend API              Offerwall iFrame
  (POST /sdk/init)         (Cross-Domain)
```

---

## Directory Structure

```
src/
├── index.ts                      # Entry point (IIFE global assignment)
├── core/
│   ├── SDK.ts                   # Main SDK class
│   ├── lifecycle/
│   │   ├── init.ts             # Initialization flow
│   │   └── destroy.ts          # Cleanup flow
│   ├── events/
│   │   ├── emitter.ts          # Event emitter class
│   │   └── eventTypes.ts       # Event constants
│   └── state/
│       ├── sdkState.ts         # SDK runtime state
│       └── sessionState.ts     # Session state
├── services/
│   ├── api/
│   │   ├── apiClient.ts        # HTTP client (fetch wrapper)
│   │   └── endpoints.ts        # API endpoint constants
│   ├── storage/
│   │   └── storage.ts          # Cookie-based storage
│   ├── session/
│   │   └── session.ts          # Session lifecycle
│   ├── logger/
│   │   └── logger.ts           # Structured logger
│   └── widget/
│       ├── modal.ts            # Modal UI creation
│       └── widget.ts           # Widget API
├── modules/
│   └── widget/
│       ├── modal.ts            # Deprecated (use services)
│       └── widget.ts           # Deprecated (use services)
├── types/
│   ├── sdk.ts                  # Type definitions
│   ├── errors.ts               # Error classes
│   └── global.d.ts             # Global type declarations
└── utils/
    ├── validate.ts             # Validation functions
    ├── uuid.ts                 # UUID v4 generation
    ├── environment.ts          # Environment detection
    └── dom.ts                  # DOM utilities
```

---

## Data Flow

### 1. Initialization Flow

```
Publisher calls: GrowBolt.init(config)
         │
         ▼
SDK.init() validates config
         │
         ▼
validateConfig() checks:
  • apiKey present and ≥8 chars
  • baseUrl valid URL format
  • timeout is non-negative
         │
    ┌────┴────┐
    ▼         ▼
  Valid     Invalid
    │         │
    │         └─> Throw ValidationError
    │
    ▼
Store config in sdkState
    │
    ▼
SessionService:
  1. Try to restore session from cookies
  2. If none exists, create new session (UUID + timestamp)
  3. Store session in cookies (7-day TTL)
    │
    ▼
ApiClient.post('/sdk/init', {apiKey, sessionId})
    │
    ├─> Success
    │   ├─ Parse publisherConfig from response
    │   ├─ Store publisherConfig in sdkState
    │   └─ Emit 'sdk_initialized' event
    │
    └─> Failure
        ├─ Log warning (offline mode)
        └─ Still emit 'sdk_initialized' (continue gracefully)
    │
    ▼
Set sdkState.initialized = true
    │
    ▼
Return {ok: true, session, publisherConfig}
```

### 2. Widget Lifecycle

```
Publisher calls: GrowBolt.openOfferwall(opts)
         │
         ▼
Check sdkState.initialized
    │
    ├─> false: Log warning, return (no-op)
    │
    └─> true: Continue
        │
        ▼
    Determine offerwall URL:
      1. opts.url (if provided)
      2. sdkState.config.offerwallUrl (if set)
      3. 'about:blank' (fallback)
        │
        ▼
    ModalManager.createModal(url):
      1. Check if modal already exists
      2. Create fixed overlay div with:
         • 900x600px white container
         • Dark backdrop with click-outside-to-close
         • iframe pointing to offerwall URL
      3. Append to document.body
      4. Emit 'widget_opened' event
        │
        ▼
    Return (non-blocking)


Publisher calls: GrowBolt.closeOfferwall()
         │
         ▼
    ModalManager.closeModal():
      1. Find modal by ID
      2. Remove from DOM
      3. Emit 'widget_closed' event
        │
        ▼
    Return (non-blocking)
```

### 3. Cleanup Flow

```
Publisher calls: GrowBolt.destroy()
         │
         ▼
SDK.destroy():
  1. Clear initPromise (reset init state)
  2. Clear eventQueue (discard pending events)
  3. Close any open modals
  4. SessionService.clearSession() → remove cookies
  5. resetSdkState() → clear all SDK state
  6. resetSessionState() → clear session state
  7. Emit 'sdk_destroyed' event
        │
        ▼
Return {ok: true}
```

---

## Event System Architecture

The SDK uses a **Map-based listener collection** pattern:

```typescript
class Emitter {
  listeners: Map<string, Set<Listener>> = new Map()
  
  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    
    // Return unsubscribe function
    return () => this.off(event, listener)
  }
  
  emit(event: string, payload: any) {
    const listeners = this.listeners.get(event)
    listeners?.forEach(listener => {
      try {
        listener(payload)
      } catch (err) {
        console.error(`Listener error for '${event}':`, err)
      }
    })
  }
}
```

**Benefits:**

- ✅ O(1) event subscription/emission
- ✅ Multiple listeners per event
- ✅ Error isolation (one listener's error doesn't affect others)
- ✅ Automatic unsubscribe function
- ✅ Garbage-collectable when all listeners removed

---

## State Management

### SDK State

```typescript
{
  initialized: boolean,          // Has init completed?
  config: SDKConfig | null,      // Current config
  widgetOpen: boolean,           // Is modal visible?
  publisherConfig: object | null // Backend config
}
```

**Reset Strategy:** `resetSdkState()` clears all fields on destroy
**Scope:** Global (singleton instance)
**Mutation Points:**

- init() → sets config, initialized
- destroy() → resets all
- openOfferwall() → sets widgetOpen
- closeOfferwall() → clears widgetOpen

### Session State

```typescript
{
  sessionId: string | null,      // UUID v4
  startedAt: number | null       // Timestamp ms
}
```

**Persistence:** Cookies with `growbolt_session` key
**TTL:** 7 days
**Reset Strategy:** Cleared on destroy()
**Sync Points:** Session restored from cookies on init if exists

---

## Security Architecture

### Cookie-Based Storage

```
Storage Format:
  Name:     growbolt_<key>
  Value:    JSON-encoded, URL-encoded
  Path:     /
  Max-Age:  604800 (7 days)
  SameSite: Lax
  HttpOnly: false (SDK needs read access)
  Secure:   Set by backend for HTTPS

Example:
  growbolt_session=%7B%22sessionId%22%3A%22...%22%2C%22startedAt%22%3A123456%7D
```

**Why not localStorage?**

- ❌ Accessible to all inline scripts (XSS vulnerability)
- ❌ No expiration (indefinite storage)
- ✅ Cookies have SameSite protection
- ✅ Cookies can be HttpOnly (set by backend)
- ✅ Cookies have TTL/expiration

### API Request Credentials

```javascript
// ApiClient includes credentials mode
const init: RequestInit = {
  credentials: 'include',  // Send cookies with cross-domain requests
  headers: {
    'Content-Type': 'application/json',
    ...customHeaders
  }
};

const response = await fetch(url, init);
```

**Credentials Modes:**

- `'include'` - Send cookies (for authenticated endpoints)
- `'same-origin'` - Send cookies only for same-origin requests
- `'omit'` - Never send cookies

### Validation Strategy

**Three-layer validation:**

1. **Client-side validation** (immediate feedback)
   - API key format and length
   - URL format validation
   - Timeout values

2. **Backend validation** (security)
   - Verify API key against database
   - Validate session ID format
   - Check rate limits

3. **Type safety** (compile-time)
   - TypeScript interface enforcement
   - IDE autocomplete support
   - Build-time type checking

---

## Performance Optimization

### Bundle Size Reduction

| Technique | Impact |
|-----------|--------|
| IIFE format (no module overhead) | -2KB |
| Minification | -3KB |
| Gzip compression | -4.5KB from 7KB |
| Tree-shaking (removed) | -0.5KB |
| **Total** | **7.02 KB gzipped** |

### Runtime Optimization

1. **Lazy Initialization**

   ```javascript
   // Does not block page load
   GrowBolt.init(config);  // Returns Promise, non-blocking
   ```

2. **Session Caching**

   ```javascript
   // Restored from cookies, no backend call
   const session = SessionService.restoreSession();
   ```

3. **Event Debouncing**
   - Listeners wrapped in try-catch (error isolation)
   - No memory leaks from orphaned listeners
   - Automatic cleanup via unsubscribe function

4. **Modal Reuse**
   - Checks if modal exists before creating
   - Reuses same DOM element on multiple opens
   - Removes only on explicit close or destroy

---

## Testing Strategy

### Unit Testing

**Covered Components:**

- Validation utilities (config, apiKey, URL, sessionId)
- UUID generation (format and uniqueness)
- Storage (set, get, remove operations)
- Logger (levels, formatting)
- Emitter (on, off, emit, error isolation)

### Integration Testing

**Test Scenarios:**

1. Full init → open → close → destroy cycle
2. Multiple init calls (should return cached Promise)
3. Event subscription/emission
4. Session persistence across page reloads
5. Error handling (network, validation, timeout)

### Playground Testing

**Manual Verification:**

- [ ] SDK loads on page
- [ ] window.GrowBolt exists with all methods
- [ ] init() accepts config and calls backend
- [ ] destroy() cleans up state
- [ ] Events emit correctly
- [ ] Modal opens/closes properly

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Fetch API | ✅ | ✅ | ✅ | ✅ |
| Cookies | ✅ | ✅ | ✅ | ✅ |
| SameSite | ✅ | ✅ | ✅ | ✅ |
| Crypto.getRandomValues | ✅ | ✅ | ✅ | ✅ |
| Map/Set | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions:**

- Chrome 51+ (Fetch)
- Firefox 52+ (Fetch)
- Safari 10.1+ (Fetch)
- Edge 15+ (Fetch)

---

## Monitoring & Debugging

### Logger Levels

```typescript
LogLevel.DEBUG = 0   // All messages
LogLevel.INFO  = 1   // Info and above
LogLevel.WARN  = 2   // Warn and above
LogLevel.ERROR = 3   // Only errors
```

**Enable Debug Mode:**

```javascript
window.GrowBolt.logger?.setLevel(0);  // Show all logs
```

**Log Format:**

```
[GrowBolt] [LEVEL] message args...
[GrowBolt] [INFO] SDK initializing
[GrowBolt] [DEBUG] Session: abc-123-def
[GrowBolt] [WARN] Backend initialization failed, continuing offline
[GrowBolt] [ERROR] init error Error: apiKey is required
```

### Key Debugging Points

1. **Session Tracking**

   ```javascript
   // Check current session
   const session = document.cookie
     .split(';')
     .find(c => c.trim().startsWith('growbolt_session='));
   ```

2. **Event Subscription**

   ```javascript
   // Verify listener registered
   window.GrowBolt.on('sdk_initialized', () => {
     console.log('✓ Listener called');
   });
   ```

3. **State Inspection**

   ```javascript
   // Check SDK state (if exposed for debugging)
   console.log('Initialized:', window.GrowBolt.initialized);
   console.log('Config:', window.GrowBolt.config);
   ```

---

## Future Enhancements

- [ ] WebSocket support for real-time events
- [ ] Service Worker integration for offline support
- [ ] Analytics batch transmission
- [ ] Custom iframe sandbox policies
- [ ] Telemetry and performance metrics
- [ ] A/B testing framework
- [ ] Advanced error recovery strategies
- [ ] Multi-currency support
- [ ] Localization framework
- [ ] Progressive widget loading

---

## Contributing

For architecture questions or improvement suggestions, see the main repository documentation.
