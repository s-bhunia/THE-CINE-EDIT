type Listener = () => void;

export interface BootHold {
  /** 0–1, for assets that can report partial progress (video buffering). */
  progress(fraction: number): void;
  release(): void;
}

let introDone = false;
let routeReady = false;
const holds = new Map<symbol, number>();
let released = 0;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener());

/**
 * Whether the boot splash has finished and handed the screen over, and what it
 * is still waiting on before it may.
 *
 * Anything the first screen cannot honestly be shown without — the hero clip,
 * its poster — takes a hold while the splash is up and releases it once loaded.
 * The splash lifts when the routed page has committed (so every hold that page
 * wants has been taken) and no hold is outstanding.
 */
export const bootStore = {
  hold(): BootHold {
    const key = Symbol('boot-hold');
    if (introDone) return { progress() {}, release() {} };
    holds.set(key, 0);
    emit();
    return {
      progress(fraction) {
        if (!holds.has(key)) return;
        holds.set(key, Math.min(1, Math.max(holds.get(key) ?? 0, fraction)));
        emit();
      },
      release() {
        if (!holds.delete(key)) return;
        released += 1;
        emit();
      },
    };
  },
  markRouteReady() {
    if (routeReady) return;
    routeReady = true;
    emit();
  },
  markIntroDone() {
    if (introDone) return;
    introDone = true;
    holds.clear();
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return introDone;
  },
  /** True once the page has committed and nothing it asked for is still loading. */
  getAssetsReady() {
    return routeReady && holds.size === 0;
  },
  /** Released holds count as whole, so the figure only ever climbs. */
  getAssetProgress() {
    if (!routeReady) return 0;
    if (holds.size === 0) return 1;
    let sum = released;
    holds.forEach((value) => (sum += value));
    return sum / (released + holds.size);
  },
};
