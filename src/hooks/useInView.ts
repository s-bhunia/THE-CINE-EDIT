import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

interface UseInViewOptions {
  /** Fires a little before the element arrives, so the reveal is already moving. */
  rootMargin?: string;
  threshold?: number;
  /**
   * Latch on the first arrival and stop watching (the default), or keep
   * reporting so a reveal plays backwards when it leaves again.
   *
   * A pinned curtain never stops intersecting the viewport, so anything using
   * `once: false` in the staged layout needs a centre band as its rootMargin —
   * something like `-45% 0px -45% 0px` — or it latches in on arrival and never
   * reports leaving.
   */
  once?: boolean;
}

/**
 * Reports when an element reaches the viewport. One observer per group: the
 * section watches, and its children take staggered delays off the same signal
 * so they land in sequence rather than all at once.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '-12% 0px -8% 0px',
  threshold = 0,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((entry) => entry.isIntersecting);
        if (!once) {
          setInView(intersecting);
          return;
        }
        if (intersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin, threshold, once]);

  return { ref, inView };
}
