import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { works } from '@/content/works';
import { MicroPreview } from '@/components/media/MicroPreview';
import { fadeInUp } from '@/lib/motion/variants';
import { toMinutesSeconds } from '@/lib/format/duration';
import { Meta } from '@/components/seo/Meta';

const FILTERS = [
  'All',
  'Wedding Teaser',
  'Pre-Wedding',
  'Wedding Highlights',
  'Colour Grading',
] as const;

export function SelectsRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get('filter') || 'All';

  const filteredWorks = works.filter((work) =>
    activeFilter === 'All' ? true : work.category === activeFilter,
  );

  return (
    <div className="pt-32 px-6 pb-24 max-w-[1920px] mx-auto min-h-screen">
      <Meta
        title="Selects"
        description="Filterable selects of wedding teasers, pre-wedding films, wedding highlights, and colour grading work."
        breadcrumbs={[
          { name: 'Reel', path: '/' },
          { name: 'Selects', path: '/work' },
        ]}
      />
      <div className="mb-12 border-b border-ink-line pb-4">
        <span className="metadata text-bone-dim block mb-2">
          SEQ 05 — SELECTS — 24 FPS
        </span>
        <h1 className="font-display text-4xl text-bone">Selects</h1>
      </div>

      <div className="flex gap-8 mb-16 metadata text-sm overflow-x-auto no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSearchParams({ filter })}
            className={`whitespace-nowrap uppercase transition-colors ${activeFilter === filter ? 'text-safelight' : 'text-bone-dim hover:text-bone'}`}
          >
            {activeFilter === filter && <span className="text-safelight mr-2">V1</span>}
            {filter}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16"
      >
        <AnimatePresence mode="popLayout">
          {filteredWorks.map((work) => (
            <motion.a
              href={`/work/${work.slug}`}
              key={work.slug}
              layout
              {...fadeInUp}
              className="group block"
            >
              <div
                className="w-full bg-ink-raise overflow-hidden mb-4 relative"
                style={{ aspectRatio: work.aspect.replace(':', '/') }}
              >
                <MicroPreview
                  id={work.slug}
                  previewSrc={work.previewSources?.h264 || ''}
                  posterSrc={work.posterAvif}
                />
              </div>
              <div className="flex flex-col gap-1 metadata text-sm">
                <span className="text-bone">{work.client}</span>
                <span className="text-bone-dim">
                  {work.venue} — {work.year} — {toMinutesSeconds(work.runtimeSeconds)}
                </span>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
