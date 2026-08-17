import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import { SECTION_MS, ELEMENT_MS } from '@/lib/motion/durations';
import { ENTRANCE_TIMING, TEXT_ENTERS_AT_WIPE_FRACTION } from './tokens';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type RevealProps = ComponentPropsWithRef<'div'> & {
  delayMs?: number;
  rootMargin?: string;
};

const TEXT_DELAY_MS = Math.round(SECTION_MS * TEXT_ENTERS_AT_WIPE_FRACTION);

export function Reveal({
  delayMs = 0,
  rootMargin = '-10% 0px',
  className,
  children,
  ...rest
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin]);

  const animate = !reducedMotion;

  return (
    <div
      ref={containerRef}
      data-revealed={revealed || undefined}
      className={cn('flex flex-col gap-4', className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="block h-px w-full origin-left bg-ink-line"
        style={
          animate
            ? {
                transform: revealed ? 'scaleX(1)' : 'scaleX(0)',
                transitionProperty: 'transform',
                transitionDuration: `${SECTION_MS}ms`,
                transitionTimingFunction: ENTRANCE_TIMING,
                transitionDelay: `${delayMs}ms`,
              }
            : undefined
        }
      />
      <div
        style={
          animate
            ? {
                opacity: revealed ? 1 : 0,
                transitionProperty: 'opacity',
                transitionDuration: `${ELEMENT_MS}ms`,
                transitionTimingFunction: ENTRANCE_TIMING,
                transitionDelay: `${delayMs + TEXT_DELAY_MS}ms`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
