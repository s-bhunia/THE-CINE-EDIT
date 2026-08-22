import { useCallback, useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { WHEEL_SIZE_PX, type PuckPosition } from '@/lib/grade/wheels';

interface GradeWheelProps {
  label: string;
  puck: PuckPosition;
  onChange: (next: PuckPosition) => void;
  onReset: () => void;
  animated: boolean;
  expanded: boolean;
}

const HUE_RING =
  'conic-gradient(from 0deg, #ff2d2d 0deg, #ff2dd0 60deg, #2d4dff 120deg, #2ddbff 180deg, #35ff5a 240deg, #ffe02d 300deg, #ff2d2d 360deg)';

const COMET_TAIL =
  'conic-gradient(from 0deg, rgba(233,226,214,0.95) 0deg, rgba(233,226,214,0) 10deg, rgba(233,226,214,0) 200deg, rgba(233,226,214,0.08) 250deg, rgba(233,226,214,0.28) 300deg, rgba(233,226,214,0.62) 338deg, rgba(233,226,214,0.95) 360deg)';

const RING_MASK = 'radial-gradient(closest-side, transparent 0 72%, #000 79%, #000 100%)';

const KEY_STEP = 0.08;

function clampToDisc(x: number, y: number): PuckPosition {
  const radius = Math.hypot(x, y);
  if (radius <= 1) return { x, y };
  return { x: x / radius, y: y / radius };
}

export function GradeWheel({
  label,
  puck,
  onChange,
  onReset,
  animated,
  expanded,
}: GradeWheelProps) {
  const discRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const pointerToPuck = useCallback((clientX: number, clientY: number) => {
    const disc = discRef.current;
    if (!disc) return null;
    const rect = disc.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return clampToDisc(
      (clientX - cx) / (rect.width / 2),
      -(clientY - cy) / (rect.height / 2),
    );
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const first = pointerToPuck(event.clientX, event.clientY);
      if (first) onChange(first);

      const pointerId = event.pointerId;

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const next = pointerToPuck(moveEvent.clientX, moveEvent.clientY);
        if (next) onChange(next);
        moveEvent.preventDefault();
      };

      const onUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [onChange, pointerToPuck],
  );

  const nudge = useCallback(
    (dx: number, dy: number) => onChange(clampToDisc(puck.x + dx, puck.y + dy)),
    [onChange, puck],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-KEY_STEP, 0],
        ArrowRight: [KEY_STEP, 0],
        ArrowUp: [0, KEY_STEP],
        ArrowDown: [0, -KEY_STEP],
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        nudge(move[0], move[1]);
        return;
      }
      if (event.key === 'Home' || event.key === 'Backspace') {
        event.preventDefault();
        onReset();
      }
    },
    [nudge, onReset],
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative"
        style={{ width: `${WHEEL_SIZE_PX}px`, height: `${WHEEL_SIZE_PX}px` }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: '#000000',
            WebkitMaskImage: RING_MASK,
            maskImage: RING_MASK,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: COMET_TAIL,
            transform: 'rotateZ(var(--grade-ring-angle, 0deg))',
            WebkitMaskImage: RING_MASK,
            maskImage: RING_MASK,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ transform: 'rotateZ(var(--grade-ring-angle, 0deg))' }}
        >
          <span
            className="absolute rounded-full bg-bone"
            style={{ width: '5px', height: '5px', left: 'calc(50% - 2.5px)', top: '2px' }}
          />
        </div>

        <div
          ref={discRef}
          role="group"
          aria-label={`${label} colour balance`}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onDoubleClick={onReset}
          className="absolute rounded-full cursor-crosshair bg-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-safelight"
          style={{ inset: '8px', touchAction: 'none' }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: HUE_RING,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: HUE_RING, opacity: 0.14 }}
          />

          <span
            aria-hidden="true"
            className="absolute bg-bone-dim"
            style={{
              left: '14%',
              right: '14%',
              top: 'calc(50% - 0.5px)',
              height: '1px',
              opacity: 0.4,
            }}
          />
          <span
            aria-hidden="true"
            className="absolute bg-bone-dim"
            style={{
              top: '14%',
              bottom: '14%',
              left: 'calc(50% - 0.5px)',
              width: '1px',
              opacity: 0.4,
            }}
          />

          <span
            aria-hidden="true"
            className="absolute rounded-full bg-bone"
            style={{
              width: '9px',
              height: '9px',
              left: `calc(50% + ${puck.x * 46}% - 4.5px)`,
              top: `calc(50% - ${puck.y * 46}% - 4.5px)`,
              transition: animated ? 'left 120ms linear, top 120ms linear' : 'none',
            }}
          />

          <label className="sr-only" htmlFor={`${inputId}-x`}>
            {label} red-cyan balance
          </label>
          <input
            id={`${inputId}-x`}
            className="sr-only"
            type="range"
            min={-1}
            max={1}
            step={0.02}
            value={puck.x}
            onChange={(event) =>
              onChange(clampToDisc(Number(event.target.value), puck.y))
            }
          />
          <label className="sr-only" htmlFor={`${inputId}-y`}>
            {label} magenta-green balance
          </label>
          <input
            id={`${inputId}-y`}
            className="sr-only"
            type="range"
            min={-1}
            max={1}
            step={0.02}
            value={puck.y}
            onChange={(event) =>
              onChange(clampToDisc(puck.x, Number(event.target.value)))
            }
          />
        </div>
      </div>

      <span
        className={cn(
          'metadata uppercase bg-ink px-1 text-bone-dim transition-opacity duration-120',
          expanded
            ? 'opacity-100'
            : 'opacity-0 group-hover/grade:opacity-100 group-focus-within/grade:opacity-100',
        )}
        style={{ fontSize: '9px' }}
      >
        {label}
      </span>
    </div>
  );
}
