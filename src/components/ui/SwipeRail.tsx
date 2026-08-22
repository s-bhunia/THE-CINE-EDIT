import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SwipeRailProps {
  /** Number of slides, for the scrub readout. */
  count: number;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  /** Rendered to the right of the counter — usually a "see all" link. */
  action?: ReactNode;
}

/**
 * Horizontal snap rail with a scrub bar instead of dots, so it reads like a
 * timeline and stays legible whether it holds three slides or fifteen. Keeps
 * long sections short on a phone: the page scrolls past a section in one screen
 * while the content itself is swiped through.
 */
export function SwipeRail({
  count,
  ariaLabel,
  children,
  className,
  action,
}: SwipeRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const centre = rail.scrollLeft + rail.clientWidth / 2;

    let nearest = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const [index, child] of Array.from(rail.children).entries()) {
      if (!(child instanceof HTMLElement)) continue;
      const distance = Math.abs(child.offsetLeft + child.offsetWidth / 2 - centre);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = index;
      }
    }
    setActive(nearest);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    // Lenis only drives the window, so a rail's own scroll events do arrive.
    rail.addEventListener('scroll', onScroll, { passive: true });
    sync();

    return () => {
      rail.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sync]);

  const progress = count > 0 ? ((active + 1) / count) * 100 : 0;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        ref={railRef}
        role="group"
        aria-label={ariaLabel}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 pb-1"
        style={{ scrollPaddingLeft: '1.5rem', touchAction: 'pan-x pan-y' }}
      >
        {children}
      </div>

      <div className="px-6 flex items-center gap-4">
        <div className="relative h-px flex-1 bg-ink-line" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 bg-safelight transition-[width] duration-280 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="metadata text-[10px] text-bone-dim tabular-nums flex-none">
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        {action}
      </div>
    </div>
  );
}
