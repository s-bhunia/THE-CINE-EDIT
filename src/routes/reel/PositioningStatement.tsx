import { site } from '@/content/site';

export function PositioningStatement() {
  return (
    <section className="px-6 py-24 max-w-[1920px] mx-auto">
      <div className="max-w-[48ch]">
        <p className="font-display text-3xl md:text-4xl text-bone leading-tight tracking-tight">
          {site.positioning.statement}
        </p>
        <div className="w-16 h-px bg-ink-line mt-8 mb-4" />
        <span className="metadata text-sm text-bone-dim">
          {site.positioning.attribution}
        </span>
      </div>
    </section>
  );
}
