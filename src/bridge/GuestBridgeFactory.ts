import type { GuestBridge } from './GuestBridge';
import { PostMessageGuestBridge } from './PostMessageGuestBridge';
import { AndroidGuestBridge } from './AndroidGuestBridge';
import { IOSGuestBridge } from './IOSGuestBridge';

function isAndroidWebView(): boolean {
  return typeof (window as unknown as Record<string, unknown>).GrowBoltAndroid !== 'undefined';
}

function isIOSWebView(): boolean {
  const w = window as unknown as {
    webkit?: { messageHandlers?: { GrowBolt?: unknown } };
  };
  return w.webkit?.messageHandlers?.GrowBolt !== undefined;
}

export function createGuestBridge(): GuestBridge {
  if (isAndroidWebView()) return new AndroidGuestBridge();
  if (isIOSWebView()) return new IOSGuestBridge();
  return new PostMessageGuestBridge();
}
