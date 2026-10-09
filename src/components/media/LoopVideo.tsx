import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { bootStore } from '@/store/boot';

interface LoopVideoProps {
  av1Src?: string;
  hevcSrc?: string;
  h264Src: string;
  h264SrcNarrow?: string;
  posterSrc: string;
  narrowBreakpoint?: string;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
  plateHidden?: boolean;
  /** Held false while the boot splash covers the screen, so the loop is not
   *  already mid-shot by the time anyone can see it. */
  startWhen?: boolean;
  /** True once something opaque is over the plate. Pausing also idles the GL
   *  plate, which only runs its rAF while the video is playing. */
  paused?: boolean;
  /** Keeps the boot splash up until the poster is decoded and the clip can
   *  play through, so the plate is never revealed black. */
  holdsBoot?: boolean;
}

const REVEAL_EVENTS = ['loadeddata', 'canplay', 'playing'] as const;
const HAVE_METADATA = 1;
const HAVE_CURRENT_DATA = 2;
const HAVE_ENOUGH_DATA = 4;
/** Seconds buffered ahead that count as "loaded" for the splash's bar. */
const BOOT_BUFFER_TARGET_S = 6;

export function LoopVideo({
  av1Src,
  hevcSrc,
  h264Src,
  h264SrcNarrow,
  posterSrc,
  narrowBreakpoint = '(max-width: 768px)',
  onVideoElement,
  plateHidden = false,
  startWhen = true,
  paused = false,
  holdsBoot = false,
}: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  // Decided once: only the hard load that shows the splash waits on this clip.
  const [booting] = useState(() => holdsBoot && !bootStore.getSnapshot());
  const { allowHeroVideo } = useMediaCapability();
  const [showVideo, setShowVideo] = useState(false);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const started = video.play();
    if (!started) return;
    void started.catch(() => {
      // A refusal here is usually a backgrounded tab rather than a starved
      // buffer, and reloading would throw away data already held — with no
      // autoplay attribute left to fall back on, nothing would restart it.
      // The visibilitychange handler below covers that case, so only force a
      // fetch when the media genuinely has nothing to play.
      if (video.readyState >= HAVE_CURRENT_DATA) return;
      video.preload = 'auto';
      video.load();
      video.addEventListener('canplay', () => void video.play().catch(() => {}), {
        once: true,
      });
    });
  }, []);

  // Read through a ref so a change of heart about playback never re-runs the
  // effect below — its cleanup strips the src, which would throw away the
  // buffer and hand GlCanvas a null element mid-scene.
  const startWhenRef = useRef(startWhen);
  startWhenRef.current = startWhen;

  useEffect(() => {
    const video = videoRef.current;
    onVideoElement?.(video);
    if (!video || !allowHeroVideo) return;

    const reveal = () => setShowVideo(true);
    for (const eventName of REVEAL_EVENTS) video.addEventListener(eventName, reveal);

    if (video.readyState >= HAVE_CURRENT_DATA) reveal();

    const syncWithVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (startWhenRef.current) attemptPlay();
      } else {
        video.pause();
      }
    };
    document.addEventListener('visibilitychange', syncWithVisibility);

    return () => {
      for (const eventName of REVEAL_EVENTS) video.removeEventListener(eventName, reveal);
      document.removeEventListener('visibilitychange', syncWithVisibility);
      video.pause();
      video.removeAttribute('src');
      video.load();
      onVideoElement?.(null);
    };
  }, [allowHeroVideo, onVideoElement, attemptPlay]);

  useEffect(() => {
    if (!booting) return;
    const poster = posterRef.current;
    if (!poster) return;
    const hold = bootStore.hold();
    if (poster.complete) {
      hold.release();
      return;
    }
    poster.addEventListener('load', hold.release, { once: true });
    poster.addEventListener('error', hold.release, { once: true });
    return () => {
      poster.removeEventListener('load', hold.release);
      poster.removeEventListener('error', hold.release);
      hold.release();
    };
  }, [booting]);

  useEffect(() => {
    const video = videoRef.current;
    if (!booting || !video || !allowHeroVideo) return;
    const hold = bootStore.hold();

    const measure = () => {
      if (video.readyState >= HAVE_ENOUGH_DATA) return hold.release();
      const { buffered, duration } = video;
      if (buffered.length === 0) return;
      const ahead = buffered.end(buffered.length - 1) - video.currentTime;
      const target = Math.min(BOOT_BUFFER_TARGET_S, duration || BOOT_BUFFER_TARGET_S);
      if (ahead >= target) return hold.release();
      hold.progress(ahead / target);
    };
    const events = ['progress', 'loadeddata', 'canplay', 'canplaythrough'] as const;
    for (const name of events) video.addEventListener(name, measure);
    video.addEventListener('error', hold.release);
    measure();

    return () => {
      for (const name of events) video.removeEventListener(name, measure);
      video.removeEventListener('error', hold.release);
      hold.release();
    };
  }, [booting, allowHeroVideo]);

  // Playback is deliberately not an autoplay attribute: it starts here, rewound,
  // once the splash has lifted, and stops again whenever the plate is covered.
  // The rewind is guarded so it only happens on that first start — scrolling
  // back up to an uncovered hero should resume, not jump to the head of the clip.
  const hasStarted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowHeroVideo || !startWhen) return;

    if (paused) {
      video.pause();
      return;
    }

    video.preload = 'auto';
    if (!hasStarted.current) {
      hasStarted.current = true;
      if (video.readyState >= HAVE_METADATA && video.currentTime > 0) {
        video.currentTime = 0;
      }
    }
    attemptPlay();
  }, [allowHeroVideo, startWhen, paused, attemptPlay]);

  return (
    <div className="relative w-full h-full bg-ink">
      <img
        ref={posterRef}
        src={posterSrc}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {allowHeroVideo && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload={booting ? 'auto' : 'metadata'}
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-520 ease-[cubic-bezier(0.16,1,0.3,1)] ${showVideo && !plateHidden ? 'opacity-100' : 'opacity-0'}`}
        >
          {av1Src && <source src={av1Src} type="video/webm; codecs=av01.0.05M.08" />}
          {hevcSrc && <source src={hevcSrc} type="video/mp4; codecs=hev1.1.6.L93.B0" />}
          {h264SrcNarrow && (
            <source
              src={h264SrcNarrow}
              media={narrowBreakpoint}
              type="video/mp4; codecs=avc1.4D401E"
            />
          )}
          <source src={h264Src} type="video/mp4; codecs=avc1.4D401E" />
        </video>
      )}
    </div>
  );
}
