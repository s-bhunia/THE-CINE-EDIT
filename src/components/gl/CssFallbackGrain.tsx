import { PLATE_EDGE_TREATMENT, PLATE_GRAIN } from './plateEffects';

/**
 * The no-WebGL stand-in for the hero plate's film look. With both effects off
 * there is nothing left for it to draw, so it renders nothing rather than
 * layering an empty blend mode over the video.
 */
export function CssFallbackGrain() {
  if (!PLATE_GRAIN && !PLATE_EDGE_TREATMENT) return null;

  return (
    <div className="fixed inset-0 z-[5] pointer-events-none mix-blend-overlay opacity-30">
      {PLATE_GRAIN && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.25 0"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      )}

      {/* This half of the edge treatment; the WebGL plate does its own. */}
      {PLATE_EDGE_TREATMENT && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(20,14,10,0.8)_100%)] mix-blend-multiply" />
      )}
    </div>
  );
}
