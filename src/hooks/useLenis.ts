import { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router';
import { registerLenis, scrollToTop } from '@/lib/scroll';

export function useLenis() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.09,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    registerLenis(lenis);

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // A hash names an in-page target and whoever handles it owns the scroll
    // position, so resetting to the top here would just fight it.
    if (location.hash) return;
    scrollToTop();
  }, [location.pathname, location.hash]);
}
