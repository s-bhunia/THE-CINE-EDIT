import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ClipBlock } from './ClipBlock';
import { experience } from '@/content';
import { Meta } from '@/components/seo/Meta';
import { useIsPhone } from '@/hooks/useIsPhone';
import { PhoneTimeline } from './PhoneTimeline';

const ORIGIN_YEAR = 2018;
const TIMELINE_END_YEAR = 2026;
const PX_PER_YEAR = 400;
const TRACKS = ['V2 — FILMS', 'V1 — WEDDINGS', 'A1 — AWARDS', 'FX — TOOLS'] as const;
const TRACK_ROW: Record<string, (typeof TRACKS)[number]> = {
  V2: 'V2 — FILMS',
  V1: 'V1 — WEDDINGS',
  A1: 'A1 — AWARDS',
  FX: 'FX — TOOLS',
};
const PALETTE = [
  { color: 'bg-safelight/20', borderColor: 'border-safelight' },
  { color: 'bg-grade-teal/20', borderColor: 'border-grade-teal' },
  { color: 'bg-bone/10', borderColor: 'border-bone' },
];

const META = (
  <Meta
    title="Experience"
    description="Career timeline across wedding films, cinematic work, festival awards, and tools."
    breadcrumbs={[
      { name: 'Reel', path: '/' },
      { name: 'Experience', path: '/experience' },
    ]}
  />
);

export function TimelineRoute() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const isPhone = useIsPhone();

  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);

  const activeEntry = experience.find((entry) => entry.id === activeClip);

  // The scrub timeline needs 400vh of travel to drive it, which on a phone meant
  // four screens of empty scroll wrapped around a nested scroller. Phones get the
  // same stacked clips the single page uses, in normal flow.
  if (isPhone) {
    return (
      <div className="pt-24 pb-12 min-h-screen">
        {META}
        <h1 className="sr-only">Experience</h1>
        <PhoneTimeline />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full">
      {META}
      <h1 className="sr-only">Experience</h1>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink pt-24 flex flex-col">
        <div className="flex flex-col h-full w-full">
          <div className="flex-none h-12 border-b border-ink-line flex items-end pl-64">
            <motion.div style={{ x }} className="flex min-w-[300vw]">
              {[2018, 2020, 2022, 2024, 2026].map((year) => (
                <div
                  key={year}
                  className="w-[800px] border-l border-ink-line pl-2 pb-1 relative"
                >
                  <span className="metadata text-xs text-bone-dim">{year}:00:00:00</span>
                  <div className="absolute bottom-0 left-1/4 w-px h-1 bg-ink-line" />
                  <div className="absolute bottom-0 left-2/4 w-px h-2 bg-ink-line" />
                  <div className="absolute bottom-0 left-3/4 w-px h-1 bg-ink-line" />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex-1 relative flex">
            <div className="w-64 flex-none border-r border-ink-line bg-ink z-20 flex flex-col pt-8 gap-1">
              {TRACKS.map((track) => (
                <div
                  key={track}
                  className="h-20 px-4 flex items-center justify-between group hover:bg-ink-raise transition-colors"
                >
                  <span className="metadata text-sm text-bone-dim group-hover:text-bone">
                    {track}
                  </span>
                  <div className="flex gap-2 opacity-30">
                    <div className="w-2 h-2 rounded-full bg-bone" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden relative bg-[url('/grid-pattern.svg')]">
              <motion.div
                style={{ x }}
                className="absolute inset-y-0 left-0 w-[300vw] pt-8 flex flex-col gap-1"
              >
                {TRACKS.map((track) => (
                  <div key={track} className="h-20 relative">
                    {experience
                      .filter((entry) => TRACK_ROW[entry.track] === track)
                      .map((entry) => {
                        const paletteIndex = experience.indexOf(entry) % PALETTE.length;
                        const palette = PALETTE[paletteIndex]!;
                        const startPx = (entry.startYear - ORIGIN_YEAR) * PX_PER_YEAR;
                        const widthPx =
                          ((entry.endYear ?? TIMELINE_END_YEAR) - entry.startYear) *
                          PX_PER_YEAR;

                        return (
                          <ClipBlock
                            key={entry.id}
                            title={entry.title}
                            startPx={startPx}
                            widthPx={widthPx}
                            color={palette.color}
                            borderColor={palette.borderColor}
                            onClick={() => setActiveClip(entry.id)}
                          />
                        );
                      })}
                  </div>
                ))}
              </motion.div>
            </div>

            {activeEntry && (
              <div className="absolute top-0 right-0 w-96 h-full bg-ink-raise border-l border-ink-line z-30 p-6 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-ink-line">
                  <span className="metadata text-bone-dim">CLIP PROPERTIES</span>
                  <button
                    onClick={() => setActiveClip(null)}
                    className="metadata text-bone hover:text-safelight"
                  >
                    X
                  </button>
                </div>
                <h3 className="text-2xl text-bone mb-2">{activeEntry.title}</h3>
                <span className="metadata text-sm text-bone-dim mb-8">
                  {activeEntry.role} — {activeEntry.startYear} to{' '}
                  {activeEntry.endYear ?? 'present'}
                </span>
                <p className="text-bone/80">{activeEntry.detail}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
