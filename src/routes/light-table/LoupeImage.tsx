import { useState, useRef, type MouseEvent } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';

interface LoupeImageProps {
  src: string;
  alt: string;
  onClick: () => void;
}

const LOUPE_SIZE = 180;
const LOUPE_SCALE = 2.5;

export function LoupeImage({ src, alt, onClick }: LoupeImageProps) {
  const [loupe, setLoupe] = useState({ x: 0, y: 0, active: false });
  const containerRef = useRef<HTMLButtonElement>(null);
  const { allowMotion } = useMediaCapability();
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  );

  const loupeEnabled = allowMotion && !isTouch;

  const handleMouseMove = (event: MouseEvent) => {
    if (!loupeEnabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLoupe({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => loupeEnabled && setLoupe((l) => ({ ...l, active: true }))}
      onMouseLeave={() => setLoupe((l) => ({ ...l, active: false }))}
      aria-label={`Open ${alt} in the lightbox`}
      className="relative block w-full cursor-zoom-in overflow-hidden p-0 border-0 bg-transparent focus-visible:[outline:2px_solid_var(--color-safelight)] focus-visible:[outline-offset:2px]"
    >
      <img src={src} alt={alt} loading="lazy" className="w-full h-auto bg-ink-raise" />

      {loupe.active && (
        <span
          aria-hidden="true"
          className="absolute pointer-events-none z-10 block border border-ink-line rounded-full overflow-hidden"
          style={{
            width: `${LOUPE_SIZE}px`,
            height: `${LOUPE_SIZE}px`,
            top: `calc(${loupe.y}% - ${LOUPE_SIZE / 2}px)`,
            left: `calc(${loupe.x}% - ${LOUPE_SIZE / 2}px)`,
          }}
        >
          <img
            src={src}
            alt=""
            className="absolute max-w-none"
            style={{
              width: `${LOUPE_SCALE * 100}%`,
              top: `-${loupe.y * (LOUPE_SCALE - 1)}%`,
              left: `-${loupe.x * (LOUPE_SCALE - 1)}%`,
            }}
          />
        </span>
      )}
    </button>
  );
}
