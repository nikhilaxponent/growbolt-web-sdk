import { createContext } from 'react';
import type { SDKService } from '../../types/service';

/**
 * Provides the SDK service to all offerwall UI components.
 *
 * In Phase 1 (InlineRenderer) the value is the real SDK instance.
 * In Phase 2 (IframeHost) the value will be a postMessage proxy that
 * implements SDKService without accessing the host page's globals.
 */
const SDKContext = createContext<SDKService | null>(null);

export default SDKContext;
