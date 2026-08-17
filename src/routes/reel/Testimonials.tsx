import { testimonials } from '@/content/testimonials';

export function Testimonials() {
  return (
    <section className="py-24 border-t border-ink-line px-6 max-w-[1920px] mx-auto">
      <div className="mb-12">
        <span className="metadata text-bone-dim">SEQ 04 — WORDS — 24 FPS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {testimonials.map((t) => (
          <figure key={t.id} className="flex flex-col gap-6">
            <blockquote className="font-display text-xl md:text-2xl text-bone leading-snug">
              {t.quote}
            </blockquote>
            <figcaption className="metadata text-sm text-bone-dim">
              {t.name} — {t.venue} — {t.year}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
