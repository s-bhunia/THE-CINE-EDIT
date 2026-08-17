import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type MarqueeProps = ComponentPropsWithRef<'div'> & {
  pixelsPerSecond?: number;
  pauseOnHover?: boolean;
};

export function Marquee({
  pixelsPerSecond = 40,
  pauseOnHover = true,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: MarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const copy = copyRef.current;
    if (!track || !copy) return;
    if (reducedMotion || typeof track.animate !== 'function') return;

    const startAnimation = () => {
      animationRef.current?.cancel();
      animationRef.current = null;
      const distance = copy.offsetWidth;
      if (distance <= 0 || pixelsPerSecond <= 0) return;
      animationRef.current = track.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
        {
          duration: (distance / pixelsPerSecond) * 1000,
          iterations: Infinity,
          easing: 'linear',
        },
      );
    };

    startAnimation();

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(startAnimation);
    observer?.observe(copy);

    return () => {
      observer?.disconnect();
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [reducedMotion, pixelsPerSecond]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (paused) animation.pause();
    else animation.play();
  }, [paused]);

  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-none', className)}
      onMouseEnter={(event) => {
        if (pauseOnHover) setPaused(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (pauseOnHover) setPaused(false);
        onMouseLeave?.(event);
      }}
      {...rest}
    >
      <div ref={trackRef} className="flex w-max flex-nowrap will-change-transform">
        <span ref={copyRef} className="metadata shrink-0 whitespace-nowrap pr-16">
          {children}
        </span>
        <span aria-hidden="true" className="metadata shrink-0 whitespace-nowrap pr-16">
          {children}
        </span>
      </div>
    </div>
  );
}
