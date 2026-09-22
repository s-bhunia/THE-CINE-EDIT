import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const COUNT_MS = 1500;

interface CountUpProps {
  target: number;
  shown: boolean;
  delayMs?: number;
  className?: string;
}

/**
 * Writes straight to the text node instead of holding the tally in state — a
 * counter re-rendering the tree every frame for a second and a half is a lot of
 * work for something only the digits care about.
 *
 * `shown` going false resets it, so a counter inside a reversible reveal counts
 * again the next time it is scrolled to rather than sitting at its total.
 */
export function CountUp({ target, shown, delayMs = 0, className }: CountUpProps) {
  const digitsRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = digitsRef.current;
    if (!node) return;

    if (reducedMotion) {
      node.textContent = `${target}+`;
      return;
    }

    if (!shown) {
      node.textContent = '1+';
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;

    const tick = (now: number) => {
      startedAt ??= now;
      const elapsed = now - startedAt - delayMs;

      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(1, elapsed / COUNT_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.max(1, Math.round(target * eased))}+`;

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown, target, delayMs, reducedMotion]);

  return (
    <span className={className}>
      <span className="sr-only">{target}+</span>
      <span ref={digitsRef} aria-hidden="true">
        {target}+
      </span>
    </span>
  );
}
