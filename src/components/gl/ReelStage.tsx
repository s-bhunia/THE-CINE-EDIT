import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';

const ReelScene = lazy(() => import('./ReelScene'));

const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300];

function ReelSilhouette() {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="35mm film reel"
      className="w-full h-full opacity-60"
    >
      <g
        fill="none"
        stroke="var(--color-bone-dim)"
        strokeWidth="3"
        transform="translate(100 100)"
      >
        <circle r="82" />
        <circle r="62" strokeWidth="1.5" />
        <circle r="24" />
        <circle r="9" fill="var(--color-bone-dim)" stroke="none" />
        {SPOKE_ANGLES.map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="24"
            x2="0"
            y2="82"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function ReelStage() {
  const { allowWebgl, allowMotion } = useMediaCapability();
  const holder = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = holder.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div ref={holder} className="w-full h-full">
      {allowWebgl && inView ? (
        <Suspense fallback={<ReelSilhouette />}>
          <ReelScene allowMotion={allowMotion} />
        </Suspense>
      ) : (
        <ReelSilhouette />
      )}
    </div>
  );
}
