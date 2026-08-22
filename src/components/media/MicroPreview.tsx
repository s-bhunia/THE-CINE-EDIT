import { useRef, useEffect } from 'react';
import { useActiveVideo } from '@/hooks/useActiveVideo';
import { useMediaCapability } from '@/hooks/useMediaCapability';

interface MicroPreviewProps {
  id: string;
  previewSrc: string;
  posterSrc: string;
}

export function MicroPreview({ id, previewSrc, posterSrc }: MicroPreviewProps) {
  const { isActive, requestPlayback, release } = useActiveVideo(id);
  const { allowVideoPreview } = useMediaCapability();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allowVideoPreview) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          requestPlayback();
        } else {
          release();
        }
      },
      { rootMargin: '0px', threshold: 0.6 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      release();
    };
  }, [id, allowVideoPreview, requestPlayback, release]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-ink">
      <img
        src={posterSrc}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-280"
        style={{ opacity: isActive ? 0 : 1 }}
      />

      {allowVideoPreview && isActive && previewSrc && (
        <video
          ref={videoRef}
          src={previewSrc}
          muted
          playsInline
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
