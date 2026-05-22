export async function init(config?: { apiKey?: string }) {
  try {
    console.log("GrowBolt SDK Initialized");
    if (config) console.log("init config:", config);
    // initialize internal modules here (network, storage, etc.)
    return Promise.resolve({ ok: true });
  } catch (err) {
    console.error("GrowBolt init error", err);
    return Promise.reject(err);
  }
}
