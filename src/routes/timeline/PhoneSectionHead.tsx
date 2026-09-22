import type { ReactNode } from 'react';
import { RiseIn } from '@/components/ui/RiseIn';

interface PhoneSectionHeadProps {
  /** Slate line, e.g. "SEQ 01 — SELECTS". */
  slate: string;
  title: string;
  /** Section observer state; omit for a head that is visible immediately. */
  shown?: boolean;
  children?: ReactNode;
}

/**
 * Every phone section opens with the same slate. On a single scrolling page the
 * repeated marker is what tells you a new part has started, so it is heavier
 * here than the small label the desktop routes use.
 */
export function PhoneSectionHead({
  slate,
  title,
  shown = true,
  children,
}: PhoneSectionHeadProps) {
  return (
    <div className="px-6">
      <RiseIn shown={shown}>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-px flex-none bg-safelight transition-[width] duration-520 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: shown ? '24px' : '0px' }}
          />
          <span className="metadata text-[10px] uppercase tracking-[0.2em] text-safelight">
            {slate}
          </span>
        </div>
      </RiseIn>

      <RiseIn shown={shown} delayMs={90}>
        <h2 className="font-display text-3xl text-bone tracking-tight mt-3">{title}</h2>
      </RiseIn>

      {children ? (
        <RiseIn shown={shown} delayMs={170}>
          <p className="text-bone-dim mt-3 max-w-[42ch] text-base">{children}</p>
        </RiseIn>
      ) : null}
    </div>
  );
}
