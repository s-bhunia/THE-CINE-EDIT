import { useRef } from 'react';
import { works } from '@/content/works';
import { MicroPreview } from '@/components/media/MicroPreview';
import { useDragScroll } from '@/hooks/useDragScroll';

export function SelectsStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const { dragging, onPointerDown } = useDragScroll(stripRef);

  return (
    <section className="py-24 border-t border-ink-line">
      <div className="px-6 max-w-[1920px] mx-auto mb-8">
        <span className="metadata text-bone-dim">
          SEQ 01 — SIGNATURE SELECTS — 24 FPS — 2.39:1
        </span>
      </div>

      <div
        ref={stripRef}
        onPointerDown={onPointerDown}
        className={`flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 pb-4 md:cursor-grab ${
          dragging ? 'md:cursor-grabbing snap-none select-none' : ''
        }`}
      >
        {works.slice(0, 5).map((work) => (
          <a
            href={`/work/${work.slug}`}
            key={work.slug}
            className="group flex-none w-[80vw] md:w-[520px] snap-center"
          >
            <div
              className="w-full bg-ink-raise overflow-hidden mb-3 relative"
              style={{ aspectRatio: work.aspect.replace(':', '/') }}
            >
              <MicroPreview
                id={`strip-${work.slug}`}
                previewSrc={work.previewSources?.h264 || ''}
                posterSrc={work.posterAvif}
              />
            </div>
            <div className="flex flex-col gap-1 metadata text-sm">
              <span className="text-bone">{work.client}</span>
              <span className="text-bone-dim">
                {work.venue} — {work.year}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
