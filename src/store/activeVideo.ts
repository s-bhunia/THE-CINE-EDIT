type Listener = (id: string | null) => void;

let activeId: string | null = null;
const listeners = new Set<Listener>();

export const activeVideoStore = {
  requestPlayback(id: string) {
    if (activeId === id) return;
    activeId = id;
    listeners.forEach((listener) => listener(activeId));
  },
  release(id: string) {
    if (activeId === id) {
      activeId = null;
      listeners.forEach((listener) => listener(activeId));
    }
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return activeId;
  },
};
