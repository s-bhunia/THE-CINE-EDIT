import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { cn } from '@/lib/cn';
import {
  GRADE_LOOKS,
  NEUTRAL_WHEELS,
  WHEEL_EXPANDED_SIZE_PX,
  WHEEL_IDS,
  WHEEL_SIZE_PX,
  gradeHex,
  isNeutral,
  matchesLook,
  toTransfer,
  type PuckPosition,
  type WheelId,
  type WheelState,
} from '@/lib/grade/wheels';
import { GradeWheel } from './GradeWheel';

const FILTER_ID = 'grade-media-filter';
const RING_DEGREES_PER_PIXEL = 0.06;

/**
 * The panel scales up while the hero plate is on screen, so the wheels read
 * against the video and are big enough to grab, then settles back to its
 * unobtrusive size once the plate has scrolled past. Scaling the whole aside
 * takes the labels and the reset button along with the wheels.
 */
const EXPANDED_SCALE = WHEEL_EXPANDED_SIZE_PX / WHEEL_SIZE_PX;

/**
 * Matches the wordmark's dock threshold in Header, deliberately: the panel and
 * the title shrink on the same scroll, so the furniture clears out together
 * rather than one of them sitting over the first text panel at full size.
 *
 * This replaced watching the hero's own intersection, which stopped working
 * once the hero became a pinned scene — it keeps intersecting long after a
 * curtain has covered it.
 */
const SHRINK_AFTER = '25vh';

const GRADED_TOKENS = [
  '--color-ink',
  '--color-ink-raise',
  '--color-ink-line',
  '--color-bone',
  '--color-bone-dim',
  '--color-safelight',
  '--color-halation',
  '--color-grade-teal',
] as const;

const WHEEL_LABELS: Record<WheelId, string> = {
  lift: 'Lift',
  gamma: 'Gamma',
  gain: 'Gain',
};

function readBaselinePalette(): Map<string, string> {
  const computed = getComputedStyle(document.documentElement);
  const baseline = new Map<string, string>();
  for (const token of GRADED_TOKENS) {
    const value = computed.getPropertyValue(token).trim();
    if (value) baseline.set(token, value);
  }
  return baseline;
}

export function GradeWheels() {
  const [wheels, setWheels] = useState<WheelState>(NEUTRAL_WHEELS);
  const baseline = useRef<Map<string, string> | null>(null);
  const ringsRef = useRef<HTMLElement>(null);
  const { allowMotion } = useMediaCapability();

  const expanded = !useScrolledPast(SHRINK_AFTER);

  const transfer = useMemo(() => toTransfer(wheels), [wheels]);
  const neutral = isNeutral(wheels);

  useEffect(() => {
    baseline.current = readBaselinePalette();
    return () => {
      const root = document.documentElement;
      for (const token of GRADED_TOKENS) root.style.removeProperty(token);
      root.removeAttribute('data-grade');
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const palette = baseline.current;
    if (!palette) return;

    if (neutral) {
      for (const token of GRADED_TOKENS) root.style.removeProperty(token);
      root.removeAttribute('data-grade');
      return;
    }

    for (const token of GRADED_TOKENS) {
      const source = palette.get(token);
      if (source) root.style.setProperty(token, gradeHex(source, transfer));
    }
    root.setAttribute('data-grade', 'active');
  }, [neutral, transfer]);

  useEffect(() => {
    const rings = ringsRef.current;
    if (!rings) return;
    if (!allowMotion) {
      rings.style.setProperty('--grade-ring-angle', '0deg');
      return;
    }

    // Scroll-driven, coalesced to one write per frame; idle when the page is.
    // Written on the wheels themselves, not the root, so a scroll restyles
    // three rings rather than the whole document.
    let frame = 0;
    const write = () => {
      frame = 0;
      rings.style.setProperty(
        '--grade-ring-angle',
        `${(window.scrollY * RING_DEGREES_PER_PIXEL).toFixed(2)}deg`,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [allowMotion]);

  const setPuck = useCallback(
    (id: WheelId) => (next: PuckPosition) =>
      setWheels((current) => ({ ...current, [id]: next })),
    [],
  );

  const resetWheel = useCallback(
    (id: WheelId) => () => setWheels((current) => ({ ...current, [id]: { x: 0, y: 0 } })),
    [],
  );

  return (
    <>
      {/*
       * Outside both panels on purpose. The desktop aside is display:none on a
       * phone, and a <filter> referenced by url() from a hidden subtree is not
       * something to rely on now that the phone layout grades too.
       */}
      <svg
        aria-hidden="true"
        className="fixed w-0 h-0 pointer-events-none"
        focusable="false"
      >
        <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR
              type="gamma"
              amplitude={transfer.r.amplitude}
              exponent={transfer.r.exponent}
              offset={transfer.r.offset}
            />
            <feFuncG
              type="gamma"
              amplitude={transfer.g.amplitude}
              exponent={transfer.g.exponent}
              offset={transfer.g.offset}
            />
            <feFuncB
              type="gamma"
              amplitude={transfer.b.amplitude}
              exponent={transfer.b.exponent}
              offset={transfer.b.offset}
            />
          </feComponentTransfer>
        </filter>
      </svg>

      <aside
        ref={ringsRef}
        aria-label="Primary colour grade"
        className="group/grade fixed bottom-16 left-6 z-40 hidden md:flex flex-col items-start gap-2 origin-bottom-left"
        style={{
          transform: `scale(${expanded ? EXPANDED_SCALE : 1})`,
          transition: allowMotion
            ? 'transform 620ms cubic-bezier(0.16, 1, 0.3, 1)'
            : undefined,
        }}
      >
        <button
          type="button"
          onClick={() => setWheels(NEUTRAL_WHEELS)}
          hidden={neutral}
          className="metadata uppercase bg-ink px-1 text-bone-dim hover:text-safelight transition-colors"
          style={{ fontSize: '9px' }}
        >
          Reset grade
        </button>

        <div className="flex items-end gap-3">
          {WHEEL_IDS.map((id) => (
            <GradeWheel
              key={id}
              label={WHEEL_LABELS[id]}
              puck={wheels[id]}
              onChange={setPuck(id)}
              onReset={resetWheel(id)}
              animated={allowMotion}
              expanded={expanded}
            />
          ))}
        </div>
      </aside>

      {/*
       * Phone: three draggable wheels do not fit, so the same grade is offered
       * as named looks. Rides in over the hero plate — where the video it
       * regrades actually is — and slides away once the plate is gone, mirroring
       * the way the desktop wheels shrink.
       */}
      <div
        role="group"
        aria-label="Primary colour grade"
        className="md:hidden fixed inset-x-0 bottom-20 z-40 px-6"
        style={{
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'none' : 'translateY(14px)',
          pointerEvents: expanded ? 'auto' : 'none',
          transition: allowMotion
            ? 'opacity 380ms ease-out, transform 520ms cubic-bezier(0.16, 1, 0.3, 1)'
            : undefined,
        }}
      >
        {/*
         * No "Look" caption: four named chips with colour swatches say what they
         * are, and dropping it is what lets the whole set fit a 375px screen
         * instead of clipping the last one off the edge.
         */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {GRADE_LOOKS.map((look) => {
            const active = matchesLook(wheels, look);
            return (
              <button
                key={look.id}
                type="button"
                onClick={() => setWheels(look.wheels)}
                aria-pressed={active}
                className={cn(
                  'metadata flex-none inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 uppercase tracking-widest transition-colors',
                  active
                    ? 'border-safelight bg-safelight text-ink'
                    : 'border-ink-line bg-ink/85 text-bone',
                )}
                style={{ fontSize: '10px' }}
              >
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full border border-ink/40"
                  style={{ background: gradeHex('#e9e2d6', toTransfer(look.wheels)) }}
                />
                {look.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
