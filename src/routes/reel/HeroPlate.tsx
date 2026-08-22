import { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { LoopVideo } from '@/components/media/LoopVideo';
import { CssFallbackGrain } from '@/components/gl/CssFallbackGrain';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { site } from '@/content/site';
import { showreel } from '@/content/showreel';
import { analyticsEvents } from '@/lib/analytics';

const OverlayPlayer = lazy(() =>
  import('@/components/media/OverlayPlayer').then((m) => ({ default: m.OverlayPlayer })),
);

const GlCanvas = lazy(() =>
  import('@/components/gl/GlCanvas').then((m) => ({ default: m.GlCanvas })),
);

const LETTER_STAGGER_MS = 58;

export function HeroPlate() {
  const [showReel, setShowReel] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
  const [plateLive, setPlateLive] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { allowWebgl, allowMotion } = useMediaCapability();

  // Split per word first so a line break can only ever land between words —
  // per-letter spans in a flex row would happily break "CINE" in half.
  const titleWords = useMemo(() => {
    let letter = 0;
    return site.name.split(' ').map((word) => ({
      word,
      chars: [...word].map((char) => ({ char, index: letter++ })),
    }));
  }, []);

  return (
    <section
      data-hero-plate
      className="relative w-full h-screen overflow-hidden bg-ink-raise"
    >
      {/*
       * Full-bleed: the plate used to be an inset 2.39:1 frame floating in 5%
       * padding, and now fills the viewport edge to edge. The 16:9 source is
       * object-cover'd, so a phone crops in hard on the centre of frame.
       */}
      <div className="absolute inset-0">
        <LoopVideo
          h264Src="/assets/hero/loop-1080p.mp4"
          h264SrcNarrow="/assets/hero/loop-720p.mp4"
          posterSrc="/assets/hero/poster.avif"
          onVideoElement={setHeroVideo}
          plateHidden={plateLive}
        />

        {allowWebgl && heroVideo ? (
          <Suspense fallback={<CssFallbackGrain />}>
            <GlCanvas video={heroVideo} onContextChange={setPlateLive} />
          </Suspense>
        ) : (
          <CssFallbackGrain />
        )}

        {/*
         * Top padding clears the fixed header — full-bleed had put the hero
         * wordmark directly under the header's identical one, close enough that
         * the two read as a single smeared lockup. Bottom padding clears the
         * corner furniture: the WhatsApp button, the audio meter, and on a phone
         * the row of grade looks.
         */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between px-6 md:px-10 pt-20 md:pt-24 pb-32 md:pb-24 bg-ink/10">
          <div className="relative">
            {allowMotion && <span aria-hidden="true" className="hero-title-haze" />}
            {/*
             * Set in the mono face with wide tracking to match the CE wordmark,
             * rather than the Fraunces display serif the other headings use.
             */}
            <h1 className="relative font-mono text-3xl md:text-6xl text-bone tracking-[0.06em]">
              {allowMotion ? (
                <>
                  <span className="sr-only">{site.name}</span>
                  <span aria-hidden="true">
                    {titleWords.map(({ word, chars }, wordIndex) => (
                      <span key={`${word}-${wordIndex}`}>
                        {wordIndex > 0 ? ' ' : null}
                        <span className="inline-block whitespace-nowrap">
                          {chars.map(({ char, index }) => (
                            <span
                              key={index}
                              className="hero-letter inline-block"
                              style={{
                                animationDelay: `${index * LETTER_STAGGER_MS}ms`,
                              }}
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                      </span>
                    ))}
                  </span>
                </>
              ) : (
                site.name
              )}
            </h1>
          </div>

          <div className="flex justify-end">
            <button
              ref={triggerRef}
              onClick={() => {
                setShowReel(true);
                analyticsEvents.reelPlay();
              }}
              className="metadata text-sm flex items-center gap-2 bg-ink text-bone px-4 py-2 rounded-sm border border-ink-line hover:text-safelight hover:border-safelight transition-colors"
            >
              PLAY SHOWREEL ▸
            </button>
          </div>
        </div>
      </div>

      {showReel && (
        <Suspense fallback={null}>
          <OverlayPlayer
            assetId="showreel-2026"
            label={showreel.title}
            sources={showreel.sources}
            poster={showreel.poster.jpg}
            durationSeconds={showreel.durationSeconds}
            onClose={() => {
              setShowReel(false);
              triggerRef.current?.focus();
            }}
          />
        </Suspense>
      )}
    </section>
  );
}
