import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { stills } from '@/content/stills';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { ReelWheel } from './ReelWheel';
import { useReelTransport } from './useReelTransport';

/**
 * Film carries a curl out of the reel, and the curl belongs to the material —
 * it travels with the frame rather than sitting still in space. So the tilt is
 * per frame, and its cycle is the length of one pass of the strip: that way the
 * second pass repeats the first exactly and the loop seam stays invisible.
 */
const tiltOf = (index: number) =>
  `${(Math.sin(((index % stills.length) / stills.length) * Math.PI * 2) * 1.7).toFixed(2)}deg`;

export function StillsScene() {
  const { allowMotion } = useMediaCapability();
  const { rootRef, stripRef, setPaused } = useReelTransport(allowMotion);

  // Two passes of the same frames, so the loop has somewhere to wrap to.
  const frames = [...stills, ...stills];

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden">
      {/*
       * The strip is tilted away in perspective so it reads as spooling off the
       * reel rather than sliding past it. The tilt sits on its own wrapper
       * because the transport writes translate3d onto the film itself, and one
       * transform property cannot hold both.
       */}
      <div className="reel-stage absolute inset-0 flex items-center">
        <div
          className="reel-strip flex-1 overflow-hidden"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <div className="reel-tilt">
            {/* Starts behind the reel, so the film emerges from it rather than
                beginning in open space beside it. */}
            <div ref={stripRef} className="reel-film w-max pl-[24vmin]">
              <div className="reel-rail" />

              <div className="flex items-stretch gap-[5px] px-[5px]">
                {frames.map((still, index) => (
                  <figure
                    key={`${still.id}-${index}`}
                    style={{ '--tilt': tiltOf(index) } as CSSProperties}
                    className="reel-frame relative h-[24vmin] md:h-[28vmin] aspect-[16/10] flex-none overflow-hidden bg-black"
                  >
                    <img
                      src={still.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <figcaption className="metadata absolute bottom-1 left-2 text-[10px] text-bone/70">
                      {still.frame}
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="reel-rail" />
            </div>
          </div>
        </div>
      </div>

      <ReelWheel className="pointer-events-none absolute -left-[9vmin] top-1/2 h-[54vmin] w-[54vmin] -translate-y-1/2 drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]" />

      <Link
        to="/stills"
        aria-label={`See all stills — ${stills.length} frames`}
        className="group absolute inset-0 z-20 flex items-start justify-between gap-4 px-6 md:px-10 pt-24 md:pt-28 focus-visible:outline-2 focus-visible:outline-safelight focus-visible:-outline-offset-4"
      >
        <span className="metadata rounded-sm bg-ink/70 px-2 py-1 text-xs md:text-sm text-bone-dim uppercase tracking-widest">
          SEQ 04 — STILLS — 24 FPS
        </span>
        <span className="metadata text-sm md:text-base text-bone border border-ink-line bg-ink/80 px-4 py-2 rounded-sm transition-colors group-hover:border-safelight group-hover:text-safelight">
          Light table ▸
        </span>
      </Link>
    </div>
  );
}
