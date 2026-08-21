import { useEffect, useRef, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';

interface LoopVideoProps {
  av1Src?: string;
  hevcSrc?: string;
  h264Src: string;
  h264SrcNarrow?: string;
  posterSrc: string;
  narrowBreakpoint?: string;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
  plateHidden?: boolean;
}

const REVEAL_EVENTS = ['loadeddata', 'canplay', 'playing'] as const;
const HAVE_CURRENT_DATA = 2;

export function LoopVideo({
  av1Src,
  hevcSrc,
  h264Src,
  h264SrcNarrow,
  posterSrc,
  narrowBreakpoint = '(max-width: 768px)',
  onVideoElement,
  plateHidden = false,
}: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { allowHeroVideo } = useMediaCapability();
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    onVideoElement?.(video);
    if (!video || !allowHeroVideo) return;

    const reveal = () => setShowVideo(true);
    for (const eventName of REVEAL_EVENTS) video.addEventListener(eventName, reveal);

    const attemptPlay = () => {
      const started = video.play();
      if (!started) return;
      void started.catch(() => {
        video.preload = 'auto';
        video.load();
      });
    };

    if (video.readyState >= HAVE_CURRENT_DATA) reveal();
    attemptPlay();

    const syncWithVisibility = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
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
  }, [allowHeroVideo, onVideoElement]);

  return (
    <div className="relative w-full h-full bg-ink">
      <img
        src={posterSrc}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {allowHeroVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
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
