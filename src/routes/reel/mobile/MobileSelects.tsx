import { Link } from 'react-router';
import { works } from '@/content/works';
import { MicroPreview } from '@/components/media/MicroPreview';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { RiseIn } from '@/components/ui/RiseIn';
import { useInView } from '@/hooks/useInView';
import { toMinutesSeconds } from '@/lib/format/duration';
import { MobileSectionHead } from './MobileSectionHead';

export function MobileSelects() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} id="work" className="scroll-mt-20 py-16 border-t border-ink-line">
      <MobileSectionHead slate="SEQ 01 — SELECTS" title="Selects" shown={inView}>
        Swipe the reel. Tap a card for the full film.
      </MobileSectionHead>

      <RiseIn shown={inView} delayMs={240} className="mt-8">
        <SwipeRail
          count={works.length}
          ariaLabel="Selects"
          action={
            <Link
              to="/work"
              className="metadata text-[10px] uppercase tracking-widest text-bone-dim hover:text-safelight transition-colors flex-none"
            >
              All ▸
            </Link>
          }
        >
          {works.map((work) => (
            <Link
              key={work.slug}
              to={`/work/${work.slug}`}
              className="group flex-none w-[78vw] snap-center"
            >
              <div
                className="w-full bg-ink-raise overflow-hidden relative"
                style={{ aspectRatio: work.aspect.replace(':', '/') }}
              >
                <MicroPreview
                  id={`m-${work.slug}`}
                  previewSrc={work.previewSources?.h264 || ''}
                  posterSrc={work.posterAvif}
                />
                <span className="absolute left-0 bottom-0 metadata text-[9px] uppercase tracking-widest bg-ink/85 text-safelight px-2 py-1">
                  {work.category}
                </span>
              </div>
              <div className="flex flex-col gap-1 metadata text-sm mt-3">
                <span className="text-bone">{work.client}</span>
                <span className="text-bone-dim text-xs">
                  {work.venue} — {work.year} — {toMinutesSeconds(work.runtimeSeconds)}
                </span>
              </div>
            </Link>
          ))}
        </SwipeRail>
      </RiseIn>
    </section>
  );
}
