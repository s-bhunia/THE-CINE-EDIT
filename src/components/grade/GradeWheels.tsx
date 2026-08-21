import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import {
  NEUTRAL_WHEELS,
  WHEEL_IDS,
  gradeHex,
  isNeutral,
  toTransfer,
  type PuckPosition,
  type WheelId,
  type WheelState,
} from '@/lib/grade/wheels';
import { GradeWheel } from './GradeWheel';

const FILTER_ID = 'grade-media-filter';
const RING_DEGREES_PER_PIXEL = 0.06;

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
  const { allowMotion } = useMediaCapability();

  const transfer = useMemo(() => toTransfer(wheels), [wheels]);
  const neutral = isNeutral(wheels);

  useEffect(() => {
    baseline.current = readBaselinePalette();
    return () => {
      const root = document.documentElement;
      for (const token of GRADED_TOKENS) root.style.removeProperty(token);
      root.removeAttribute('data-grade');
      root.style.removeProperty('--grade-ring-angle');
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
    if (!allowMotion) {
      document.documentElement.style.setProperty('--grade-ring-angle', '0deg');
      return;
    }

    let frame = 0;
    let lastOffset = -1;

    const tick = () => {
      const offset = window.scrollY;
      if (offset !== lastOffset) {
        lastOffset = offset;
        document.documentElement.style.setProperty(
          '--grade-ring-angle',
          `${(offset * RING_DEGREES_PER_PIXEL).toFixed(2)}deg`,
        );
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
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
    <aside
      aria-label="Primary colour grade"
      className="group/grade fixed bottom-16 left-6 z-40 hidden md:flex flex-col items-start gap-2"
    >
      <svg aria-hidden="true" className="absolute w-0 h-0" focusable="false">
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
          />
        ))}
      </div>
    </aside>
  );
}
