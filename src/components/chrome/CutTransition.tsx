import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { audioEngine } from '@/lib/audio/engine';

export function CutTransition() {
  const location = useLocation();
  const [isCutting, setIsCutting] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (prefersReducedMotion) return;

    audioEngine.play('reel-spool');
    setIsCutting(true);

    const timer = setTimeout(() => {
      setIsCutting(false);
    }, 83);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isCutting) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink pointer-events-none">
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />
    </div>
  );
}
