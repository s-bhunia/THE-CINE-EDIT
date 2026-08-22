import { useEffect, useRef } from 'react';
import { site } from '@/content/site';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import { RiseIn } from '@/components/ui/RiseIn';

const STATS = [
  { label: 'Projects Delivered', value: site.stats.projectsDelivered },
  { label: 'Happy Clients', value: site.stats.clients },
];

const COUNT_MS = 1500;

interface CountUpProps {
  target: number;
  shown: boolean;
  delayMs: number;
}

/**
 * Writes straight to the text node instead of holding the tally in state — a
 * counter re-rendering the tree every frame for a second and a half is a lot of
 * work for something only the digits care about.
 */
function CountUp({ target, shown, delayMs }: CountUpProps) {
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
    <span className="metadata text-4xl text-bone tabular-nums">
      <span className="sr-only">{target}+</span>
      <span ref={digitsRef} aria-hidden="true">
        {target}+
      </span>
    </span>
  );
}

export function MobileNumbers() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="px-6 py-14 border-t border-ink-line"
      aria-label="By the numbers"
    >
      <div className="grid grid-cols-2 gap-8">
        {STATS.map((stat, index) => (
          <RiseIn key={stat.label} shown={inView} delayMs={index * 140}>
            <div className="flex flex-col gap-2">
              <CountUp target={stat.value} shown={inView} delayMs={index * 140} />
              <span className="metadata text-[10px] text-bone-dim uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          </RiseIn>
        ))}
      </div>
    </section>
  );
}
