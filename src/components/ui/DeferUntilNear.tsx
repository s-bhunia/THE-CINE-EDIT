import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface DeferUntilNearProps {
  /** Reserved height before the children mount, to keep scrolling steady. */
  minHeight: number;
  rootMargin?: string;
  /** Needed when the anchor has to fill its parent, e.g. inside a pinned scene. */
  className?: string;
  children: ReactNode;
}

/**
 * Holds a subtree back until it is nearly on screen. The phone layout stitches
 * every section onto one page, and the enquiry form alone drags in
 * react-hook-form and zod — no reason to spend that on a visitor who only ever
 * watches the reel.
 */
export function DeferUntilNear({
  minHeight,
  rootMargin = '400px 0px',
  className,
  children,
}: DeferUntilNearProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const node = anchorRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div
      ref={anchorRef}
      className={className}
      style={mounted ? undefined : { minHeight }}
    >
      {mounted ? children : null}
    </div>
  );
}
