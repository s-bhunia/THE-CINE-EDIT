import { testimonials } from '@/content/testimonials';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { RiseIn } from '@/components/ui/RiseIn';
import { useInView } from '@/hooks/useInView';
import { MobileSectionHead } from './MobileSectionHead';

export function MobileTestimonials() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} id="words" className="scroll-mt-20 py-16 border-t border-ink-line">
      <MobileSectionHead
        slate="SEQ 06 — WORDS"
        title="What couples said"
        shown={inView}
      />

      <RiseIn shown={inView} delayMs={220} className="mt-8">
        <SwipeRail count={testimonials.length} ariaLabel="Testimonials">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex-none w-[82vw] snap-center flex flex-col gap-5 bg-ink-raise border-l-2 border-safelight p-5"
            >
              <blockquote className="font-display text-xl text-bone leading-snug">
                {testimonial.quote}
              </blockquote>
              <figcaption className="metadata text-[11px] text-bone-dim mt-auto">
                {testimonial.name} — {testimonial.venue} — {testimonial.year}
              </figcaption>
            </figure>
          ))}
        </SwipeRail>
      </RiseIn>
    </section>
  );
}
