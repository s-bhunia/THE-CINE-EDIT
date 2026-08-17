import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export function useHls(src: string | undefined, shouldAttach: boolean = true) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !shouldAttach) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        startLevel: -1,
        maxBufferLength: 20,
        maxMaxBufferLength: 40,
        backBufferLength: 30,
        abrEwmaDefaultEstimate: 800_000,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [src, shouldAttach]);

  return videoRef;
}
