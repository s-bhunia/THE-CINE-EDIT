import { useRef, useEffect, useState } from 'react';
import { useActiveVideo } from '@/hooks/useActiveVideo';
import { useMediaCapability } from '@/hooks/useMediaCapability';

const ENTER_DELAY_MS = 140;

interface MicroPreviewProps {
  id: string;
  previewSrc: string;
  posterSrc: string;
  /**
   * `in-view` watches its own box and plays when it is centred — right for a
   * rail or a page of cards. `controlled` hands the decision to the parent,
   * which is what the home grid needs so the tile under the cursor plays.
   */
  trigger?: 'in-view' | 'controlled';
  /** Only read when `trigger` is `controlled`. */
  wanted?: boolean;
}

export function MicroPreview({
  id,
  previewSrc,
  posterSrc,
  trigger = 'in-view',
  wanted = false,
}: MicroPreviewProps) {
  const { isActive, requestPlayback, release } = useActiveVideo(id);
  const { allowVideoPreview } = useMediaCapability();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // The poster holds until a frame is actually on screen, so the tile never
  // flashes to its background while the clip is still fetching.
  const [playing, setPlaying] = useState(false);
  if (!isActive && playing) setPlaying(false);

  useEffect(() => {
    if (trigger !== 'controlled' || !allowVideoPreview) return;
    if (!wanted) {
      release();
      return;
    }
    // A sweep across the board passes over several tiles; only one the
    // cursor actually settles on is worth fetching a video for.
    const timer = setTimeout(requestPlayback, ENTER_DELAY_MS);
    return () => {
      clearTimeout(timer);
      release();
    };
  }, [trigger, wanted, allowVideoPreview, requestPlayback, release]);

  useEffect(() => {
    if (trigger !== 'in-view' || !allowVideoPreview) return;
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
  }, [trigger, id, allowVideoPreview, requestPlayback, release]);

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
        style={{ opacity: isActive && playing ? 0 : 1 }}
      />

      {allowVideoPreview && isActive && previewSrc && (
        <video
          ref={videoRef}
          src={previewSrc}
          muted
          playsInline
          loop
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
