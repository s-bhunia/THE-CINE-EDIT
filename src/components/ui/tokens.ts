import type { CSSProperties } from 'react';
import { ENTRANCE_EASE, EXIT_EASE } from '@/lib/motion/easings';
import { MICRO_MS, ELEMENT_MS, SECTION_MS } from '@/lib/motion/durations';

const toCubicBezier = (points: readonly number[]) => `cubic-bezier(${points.join(', ')})`;

export const ENTRANCE_TIMING = toCubicBezier(ENTRANCE_EASE);
export const EXIT_TIMING = toCubicBezier(EXIT_EASE);

export const MICRO_DURATION = `${MICRO_MS}ms`;
export const ELEMENT_DURATION = `${ELEMENT_MS}ms`;
export const SECTION_DURATION = `${SECTION_MS}ms`;

export const TEXT_ENTERS_AT_WIPE_FRACTION = 0.6;

export const FOCUS_RING =
  'focus-visible:[outline:2px_solid_var(--color-safelight)] focus-visible:[outline-offset:2px]';

export const microTransitionStyle = (
  style: CSSProperties | undefined,
): CSSProperties => ({
  transitionDuration: MICRO_DURATION,
  transitionTimingFunction: ENTRANCE_TIMING,
  ...style,
});

export const FIELD_LABEL_CLASS = 'metadata text-sm uppercase tracking-widest text-bone';

export const FIELD_HINT_CLASS = 'metadata text-xs text-bone-dim';

export const FIELD_ERROR_CLASS = 'metadata text-xs text-safelight';

export const FIELD_CONTROL_CLASS =
  'metadata w-full rounded-[2px] bg-transparent text-bone transition-colors focus:border-bone placeholder:text-bone-dim';

export const fieldToneClass = (invalid: boolean) =>
  invalid ? 'border-safelight text-safelight' : 'border-ink-line';

export interface FieldAria {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
}

export const fieldAria = (
  id: string,
  hint: string | undefined,
  error: string | undefined,
  describedBy: string | undefined,
): FieldAria => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby':
    [describedBy, hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
});
