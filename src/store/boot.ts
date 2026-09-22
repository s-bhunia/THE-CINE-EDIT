type Listener = (introDone: boolean) => void;

let introDone = false;
const listeners = new Set<Listener>();

/**
 * Whether the boot splash has finished and handed the screen over.
 *
 * A store rather than a prop or context because two unrelated subtrees wait on
 * the same signal: the hero video (which must start from frame one, not from
 * wherever it had drifted to behind the loader) and the header wordmark (whose
 * letters should be seen being written, not play out under an opaque overlay).
 */
export const bootStore = {
  markIntroDone() {
    if (introDone) return;
    introDone = true;
    listeners.forEach((listener) => listener(introDone));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return introDone;
  },
};
