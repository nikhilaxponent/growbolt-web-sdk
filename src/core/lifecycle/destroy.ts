export function destroy() {
  try {
    console.log("GrowBolt SDK Destroyed");
    // teardown logic here (remove listeners, clean timers, etc.)
    return Promise.resolve({ ok: true });
  } catch (err) {
    console.error("GrowBolt destroy error", err);
    return Promise.reject(err);
  }
}
