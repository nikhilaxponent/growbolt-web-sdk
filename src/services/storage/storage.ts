// Cookie-based storage for small, non-sensitive values (session id etc.)
// Uses JSON-encoded values. Note: cookies have size limits (~4KB) per cookie.
const PREFIX = "growbolt_";

function encodeCookieValue(v: any) {
  try {
    return encodeURIComponent(JSON.stringify(v));
  } catch (e) {
    return "" + v;
  }
}

function decodeCookieValue(s: string | null) {
  if (!s) return null;
  try {
    return JSON.parse(decodeURIComponent(s));
  } catch (e) {
    return decodeURIComponent(s);
  }
}

export function storageSet(key: string, value: any, days = 7) {
  try {
    const name = PREFIX + key;
    const v = encodeCookieValue(value);
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${v}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch (err) {
    // noop
  }
}

export function storageGet<T = any>(key: string): T | null {
  try {
    const name = PREFIX + key + "=";
    const ca = document.cookie.split(";");
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(name) === 0) {
        const val = c.substring(name.length);
        return decodeCookieValue(val) as T;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function storageRemove(key: string) {
  try {
    const name = PREFIX + key;
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch (err) {
    // noop
  }
}

export default { storageSet, storageGet, storageRemove };
