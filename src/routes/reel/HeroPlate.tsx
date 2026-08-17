import { Suspense, lazy, useRef, useState } from 'react';
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

export function HeroPlate() {
  const [showReel, setShowReel] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
  const [plateLive, setPlateLive] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { allowWebgl } = useMediaCapability();

  return (
    <section className="relative w-full h-screen flex flex-col justify-center px-[5%] py-[5%]">
      <div className="relative w-full aspect-[3/4] md:aspect-[2.39/1] bg-ink-raise overflow-hidden flex-shrink-0">
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

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 bg-ink/10">
          <div>
            <h1 className="text-4xl md:text-6xl text-bone tracking-tight">{site.name}</h1>
            <p className="metadata mt-2 text-bone-dim uppercase">
              {site.editor} — Editor
            </p>
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
