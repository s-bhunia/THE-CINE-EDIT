import { useEffect, useRef } from 'react';

const SPEED_PX_PER_SECOND = 26;
/** Matches the sprocket ring in ReelWheel, in its own viewBox units. */
const WHEEL_RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * WHEEL_RADIUS;
/** Absorbs the jump after a tab switch rather than lurching the strip. */
const MAX_FRAME_SECONDS = 0.05;

/**
 * Runs the filmstrip past the wheel.
 *
 * Deliberately time-based rather than scroll-linked: the panel is pinned, so
 * scroll progress is already spent holding it in place and there is none left
 * to drive the reel with. Driving both the strip and the wheel from one scalar
 * means their relationship is structural — they cannot fall out of sync, so
 * nothing has to correct them.
 */
export function useReelTransport(enabled: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const strip = stripRef.current;
    if (!enabled || !root || !strip) return;

    // The strip holds two copies of the frames; one copy is the loop.
    let cycle = strip.scrollWidth / 2;
    const remeasure = () => {
      cycle = strip.scrollWidth / 2;
    };

    let offset = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;

      if (!paused.current && cycle > 0) {
        offset = (offset + SPEED_PX_PER_SECOND * delta) % cycle;
      }

      strip.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0)`;
      // On the root, not the strip: the wheel is the strip's sibling, and
      // custom properties only reach it by inheriting from a shared ancestor.
      root.style.setProperty('--turn', `${((offset / CIRCUMFERENCE) * 360).toFixed(2)}deg`);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', remeasure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', remeasure);
      strip.style.transform = '';
    };
  }, [enabled]);

  const setPaused = (value: boolean) => {
    paused.current = value;
  };

  return { rootRef, stripRef, setPaused };
}
