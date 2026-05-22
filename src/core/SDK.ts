import { init as initFn } from "./lifecycle/init";
import { destroy as destroyFn } from "./lifecycle/destroy";

export class SDK {
  // expose init/destroy as methods so callers can do GrowBolt.init()
  init(config?: { apiKey?: string }) {
    return initFn(config as any);
  }

  destroy() {
    return destroyFn();
  }
}
