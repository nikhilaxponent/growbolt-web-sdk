type Listener = (payload?: any) => void;

class Emitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(event: string, fn: Listener) {
    const set = this.listeners.get(event) || new Set<Listener>();
    set.add(fn);
    this.listeners.set(event, set);
    return () => this.off(event, fn);
  }

  off(event: string, fn?: Listener) {
    if (!this.listeners.has(event)) return;
    if (!fn) {
      this.listeners.delete(event);
      return;
    }
    const set = this.listeners.get(event)!;
    set.delete(fn);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit(event: string, payload?: any) {
    const set = this.listeners.get(event);
    if (!set) return;
    // copy to avoid mutation during iteration
    Array.from(set).forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        // swallow to avoid breaking other listeners
        console.error("Emitter listener error for", event, err);
      }
    });
  }
}

export const emitter = new Emitter();

export type { Listener };
