// Minimal UUID v4 generator (crypto-backed when available)
export function uuidv4(): string {
  if (typeof crypto !== "undefined" && (crypto as any).getRandomValues) {
    const buf = new Uint8Array(16);
    (crypto as any).getRandomValues(buf);
    // https://stackoverflow.com/a/2117523
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf).map((b) => (b + 0x100).toString(16).substr(1));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default uuidv4;
