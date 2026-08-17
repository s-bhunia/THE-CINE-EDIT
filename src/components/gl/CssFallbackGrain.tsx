export function CssFallbackGrain() {
  return (
    <div className="fixed inset-0 z-[5] pointer-events-none mix-blend-overlay opacity-30">
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,9,8,0.8)_100%)] mix-blend-multiply" />
    </div>
  );
}
