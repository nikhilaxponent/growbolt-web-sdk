import { useContext } from 'react';
import SDKContext from '../context/SDKContext';
import type { SDKService } from '../../types/service';

export function useSDK(): SDKService {
  const sdk = useContext(SDKContext);
  if (sdk === null) {
    throw new Error(
      '[GrowBolt] useSDK() was called outside of an SDKContext.Provider. ' +
        'Components must be rendered inside the offerwall opened by GrowBolt.openOfferwall().',
    );
  }
  return sdk;
}
