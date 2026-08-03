import React from 'react';
import { createRoot } from 'react-dom/client';
import { IframeHostBridge } from '../bridge/IframeHostBridge';
import { PostMessageSDKService } from './PostMessageSDKService';
import SDKContext from '../ui/context/SDKContext';
import SDKLauncher from '../ui/SDKLauncher';
import styles from '../ui/styles.css?inline';
import { injectCSS } from '../utils/dom';

injectCSS('growbolt-sdk-styles', styles);

const bridge = new IframeHostBridge();

bridge.sendReady();

bridge.waitForInit().then((initPayload) => {
  const service = new PostMessageSDKService(bridge, initPayload);

  const container = document.getElementById('root');
  if (container === null) {
    throw new Error('[GrowBolt] #root not found in offerwall document.');
  }

  createRoot(container).render(
    <SDKContext.Provider value={service}>
      <SDKLauncher onClose={() => bridge.sendClose()} />
    </SDKContext.Provider>,
  );

  bridge.sendAppReady();
}).catch((err: unknown) => {
  console.error('[GrowBolt] Offerwall failed to initialize:', err);
});
