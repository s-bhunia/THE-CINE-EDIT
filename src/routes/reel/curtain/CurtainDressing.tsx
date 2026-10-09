import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

/**
 * Out-of-focus highlights, the way light falls through a lens wide open —
 * shaded off-centre so each one reads as a sphere rather than a flat disc, then
 * blurred until it is atmosphere instead of an object.
 *
 * Sizes and offsets are in vmin so the field scales with the panel instead of
 * clustering on a phone. Negative delays start each one mid-drift, so they are
 * already out of step on the first frame rather than pulsing in unison.
 */
const ORBS = [
  { size: 30, x: 8, y: 16, dur: 34, delay: 0, warm: 1 },
  { size: 17, x: 76, y: 24, dur: 27, delay: -9, warm: 0 },
  { size: 38, x: 62, y: 74, dur: 43, delay: -17, warm: 1 },
  { size: 13, x: 31, y: 82, dur: 23, delay: -4, warm: 0 },
  { size: 22, x: 91, y: 57, dur: 38, delay: -21, warm: 1 },
];

export function CurtainDressing() {
  const ref = useRef<HTMLDivElement>(null);

  // An attribute rather than state: flipping it should not re-render the panel.
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      node.toggleAttribute('data-live', entry?.isIntersecting ?? false),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="curtain-dressing" aria-hidden="true">
      {ORBS.map((orb, index) => (
        <span
          key={index}
          className="curtain-orb"
          data-warm={orb.warm ? 'true' : 'false'}
          style={
            {
              '--orb-size': `${orb.size}vmin`,
              '--orb-x': `${orb.x}%`,
              '--orb-y': `${orb.y}%`,
              '--orb-dur': `${orb.dur}s`,
              '--orb-delay': `${orb.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
