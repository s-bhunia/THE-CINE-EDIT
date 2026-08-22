import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';
import { stills } from '@/content';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { RiseIn } from '@/components/ui/RiseIn';
import { useInView } from '@/hooks/useInView';
import { MobileSectionHead } from './MobileSectionHead';

const Lightbox = lazy(() =>
  import('@/routes/light-table/Lightbox').then((m) => ({ default: m.Lightbox })),
);

export function MobileStills() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { ref, inView } = useInView<HTMLElement>();
  const items = stills.map((still) => ({
    src: still.src,
    alt: `Frame ${still.frame}`,
  }));

  return (
    <section
      ref={ref}
      id="stills"
      className="scroll-mt-20 py-16 border-t border-ink-line"
    >
      <MobileSectionHead slate="SEQ 03 — LIGHT TABLE" title="Light Table" shown={inView}>
        Frames off the light table. Tap to open, swipe to move along the strip.
      </MobileSectionHead>

      <RiseIn shown={inView} delayMs={240} className="mt-8">
        <SwipeRail
          count={stills.length}
          ariaLabel="Stills"
          action={
            <Link
              to="/stills"
              className="metadata text-[10px] uppercase tracking-widest text-bone-dim hover:text-safelight transition-colors flex-none"
            >
              All ▸
            </Link>
          }
        >
          {stills.map((still, index) => (
            <button
              key={still.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Open frame ${still.frame}`}
              className="flex-none w-[62vw] snap-center text-left"
            >
              {/* Sprocket edges, so the rail reads as a strip of film. */}
              <div className="bg-ink-raise p-2 border-y-[6px] border-black border-dashed">
                <div className="aspect-[3/2] overflow-hidden bg-ink">
                  <img
                    src={still.src}
                    alt={`Frame ${still.frame}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="metadata text-[10px] text-bone-dim block mt-2 px-1">
                {still.frame}
              </span>
            </button>
          ))}
        </SwipeRail>
      </RiseIn>

      {activeIndex !== null && (
        <Suspense fallback={null}>
          <Lightbox
            items={items}
            index={activeIndex}
            onClose={() => setActiveIndex(null)}
            onNavigate={setActiveIndex}
          />
        </Suspense>
      )}
    </section>
  );
}
