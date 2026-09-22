import { Suspense, lazy, useRef, useState } from 'react';
import { LoopVideo } from '@/components/media/LoopVideo';
import { CssFallbackGrain } from '@/components/gl/CssFallbackGrain';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { useIntroDone } from '@/hooks/useIntroDone';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { heroMedia } from '@/content/heroMedia';
import { site } from '@/content/site';
import { showreel } from '@/content/showreel';
import { analyticsEvents } from '@/lib/analytics';

const OverlayPlayer = lazy(() =>
  import('@/components/media/OverlayPlayer').then((m) => ({ default: m.OverlayPlayer })),
);

const GlCanvas = lazy(() =>
  import('@/components/gl/GlCanvas').then((m) => ({ default: m.GlCanvas })),
);

export function HeroPlate() {
  const [showReel, setShowReel] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
  const [plateLive, setPlateLive] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { allowWebgl } = useMediaCapability();
  const introDone = useIntroDone();
  // By here the first curtain has pinned over the plate, so there is nothing
  // to see and no reason to keep decoding frames or running the GL pass.
  const covered = useScrolledPast('90vh');

  return (
    <section
      data-hero-plate
      // min-h as well as h-full: with reduced motion the pin above is auto
      // height, and a percentage height against that resolves to nothing.
      className="relative w-full h-full min-h-[100svh] overflow-hidden bg-ink-raise"
    >
      {/*
       * Full-bleed: the plate used to be an inset 2.39:1 frame floating in 5%
       * padding, and now fills the viewport edge to edge. The 16:9 source is
       * object-cover'd, so a phone crops in hard on the centre of frame.
       */}
      <div className="absolute inset-0">
        <LoopVideo
          h264Src={heroMedia.loop1080}
          h264SrcNarrow={heroMedia.loop720}
          posterSrc="/assets/hero/poster.avif"
          onVideoElement={setHeroVideo}
          plateHidden={plateLive}
          startWhen={introDone}
          paused={covered}
        />

        {allowWebgl && heroVideo ? (
          <Suspense fallback={<CssFallbackGrain />}>
            <GlCanvas video={heroVideo} onContextChange={setPlateLive} />
          </Suspense>
        ) : (
          <CssFallbackGrain />
        )}

        {/*
         * The title itself is the header's lockup, which sits large over this
         * plate and settles into the nav bar on scroll — see Wordmark. What is
         * left here is the document's heading for assistive tech and the bottom
         * row, whose padding clears the corner furniture: the WhatsApp button,
         * the audio meter, and on a phone the row of grade looks.
         */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 md:px-10 pt-20 md:pt-24 pb-32 md:pb-24 bg-ink/10">
          <h1 className="sr-only font-mono tracking-[0.06em]">{site.name}</h1>

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
