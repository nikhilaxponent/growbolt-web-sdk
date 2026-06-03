export function getEnvironment() {
  return {
    isBrowser: typeof window !== "undefined" && typeof document !== "undefined",
    isWorker:
      typeof self !== "undefined" && typeof (globalThis as any).WorkerGlobalScope !== "undefined",
    isNode: typeof (globalThis as any).process !== "undefined" && (globalThis as any).process.versions?.node,
  };
}

export function isBrowser() {
  return getEnvironment().isBrowser;
}

export function isSecureContext() {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function getUserAgent() {
  return isBrowser() ? navigator.userAgent : "unknown";
}

export function getPageUrl() {
  return isBrowser() ? window.location.href : "unknown";
}

export function getPageDomain() {
  return isBrowser() ? window.location.hostname : "unknown";
}
