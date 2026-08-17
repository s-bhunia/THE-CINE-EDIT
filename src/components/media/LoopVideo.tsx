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
  const { allowVideoPreview } = useMediaCapability();
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    onVideoElement?.(video);
    if (!video || !allowVideoPreview) return;

    const reveal = () => setShowVideo(true);
    video.addEventListener('canplay', reveal);

    const syncWithVisibility = () => {
      if (document.visibilityState === 'visible') {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };
    document.addEventListener('visibilitychange', syncWithVisibility);

    return () => {
      video.removeEventListener('canplay', reveal);
      document.removeEventListener('visibilitychange', syncWithVisibility);
      video.pause();
      video.removeAttribute('src');
      video.load();
      onVideoElement?.(null);
    };
  }, [allowVideoPreview, onVideoElement]);

  return (
    <div className="relative w-full h-full bg-ink">
      <img
        src={posterSrc}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {allowVideoPreview && (
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
