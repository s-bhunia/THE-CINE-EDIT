import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

interface UseInViewOptions {
  /** Fires a little before the element arrives, so the reveal is already moving. */
  rootMargin?: string;
  threshold?: number;
}

/**
 * Reports the first time an element reaches the viewport, then stops watching.
 * One observer per group: the section watches, and its children take staggered
 * delays off the same signal so they land in sequence rather than all at once.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '-12% 0px -8% 0px',
  threshold = 0,
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
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin, threshold]);

  return { ref, inView };
}
