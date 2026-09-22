import { testimonials } from '@/content/testimonials';
import { useInView } from '@/hooks/useInView';
import { useIsPhone } from '@/hooks/useIsPhone';
import { RiseIn } from '@/components/ui/RiseIn';
import { CURTAIN_BAND, PANEL_BODY } from '@/routes/reel/curtain/Act';
import { cn } from '@/lib/cn';
import { Slate } from './Slate';

/**
 * The content file can hold any number of quotes; the panel shows as many as
 * fit a pinned viewport and no more.
 *
 * Deliberately not an inner scroller: inside a panel that is itself pinned, a
 * scrollable region swallows the page scroll on touch, and an unfocusable one
 * is an axe violation besides.
 */
const SHOWN_ON_PHONE = 2;
const SHOWN_ON_DESKTOP = 3;

export function FeedbackCurtain() {
  const isPhone = useIsPhone();
  const shown = testimonials.slice(0, isPhone ? SHOWN_ON_PHONE : SHOWN_ON_DESKTOP);
  const { ref, inView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: CURTAIN_BAND,
  });

  return (
    <div ref={ref} className={cn(PANEL_BODY, 'gap-8 md:gap-12')}>
      <Slate shown={inView}>SEQ 05 — WORDS — 24 FPS</Slate>

      <RiseIn shown={inView} delayMs={80} variant="gate">
        <h2 className="font-display text-3xl md:text-5xl text-bone leading-tight tracking-tight">
          What couples say
        </h2>
      </RiseIn>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 content-start">
        {shown.map((quote, index) => (
          <RiseIn key={quote.id} shown={inView} delayMs={140 + index * 90}>
            <figure className="h-full flex flex-col justify-between gap-6 rounded-sm border border-ink-line bg-ink-raise p-5 md:p-6 transition-colors hover:border-bone-dim">
              <span
                aria-hidden="true"
                className="font-display text-4xl leading-none text-safelight"
              >
                &ldquo;
              </span>
              <blockquote className="font-display text-lg md:text-xl text-bone leading-snug">
                {quote.quote}
              </blockquote>
              <figcaption className="metadata text-xs text-bone-dim uppercase tracking-widest">
                {quote.name} — {quote.venue} — {quote.year}
              </figcaption>
            </figure>
          </RiseIn>
        ))}
      </div>
    </div>
  );
}
