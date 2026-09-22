const CUTOUTS = 6;
const CUTOUT_ORBIT = 86;
const CUTOUT_RADIUS = 33;

/** Wound film, read as concentric turns through the flange cutouts. */
const WINDINGS = [118, 110, 102, 94, 86, 78, 70, 62, 54];

/**
 * The feed reel. A metal flange with the film wound visible through its
 * cutouts, which is what makes it read as a reel rather than a wheel — the
 * cutouts are punched with a mask so the core genuinely shows through instead
 * of being faked with dark circles on top.
 *
 * Only the flange and core turn. The hub and the mark on it stay upright,
 * because a logo rotating through upside-down reads as a bug, not machinery.
 * Rotation arrives as --turn, written by useReelTransport from the same scalar
 * that moves the strip, so the two cannot drift apart.
 */
export function ReelWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true" focusable="false">
      <defs>
        {/* Brushed metal: a bright quarter, a dark quarter, and a soft rim. */}
        <linearGradient id="reel-metal" x1="12%" y1="4%" x2="86%" y2="96%">
          <stop offset="0%" stopColor="#d9d5cf" />
          <stop offset="26%" stopColor="#8f8a84" />
          <stop offset="48%" stopColor="#efece7" />
          <stop offset="68%" stopColor="#7b7671" />
          <stop offset="100%" stopColor="#3f3b37" />
        </linearGradient>

        <linearGradient id="reel-hub-metal" x1="20%" y1="8%" x2="80%" y2="92%">
          <stop offset="0%" stopColor="#e6e2dc" />
          <stop offset="55%" stopColor="#8a8580" />
          <stop offset="100%" stopColor="#4a4642" />
        </linearGradient>

        <radialGradient id="reel-core" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#2b2420" />
          <stop offset="100%" stopColor="#0d0a08" />
        </radialGradient>

        {/* Punches the spoke cutouts and the hub clean out of the flange. */}
        <mask id="reel-flange-mask">
          <rect width="300" height="300" fill="#000" />
          <circle cx="150" cy="150" r="142" fill="#fff" />
          {Array.from({ length: CUTOUTS }, (_, index) => {
            const angle = (index * 2 * Math.PI) / CUTOUTS - Math.PI / 2;
            return (
              <circle
                key={index}
                cx={150 + Math.cos(angle) * CUTOUT_ORBIT}
                cy={150 + Math.sin(angle) * CUTOUT_ORBIT}
                r={CUTOUT_RADIUS}
                fill="#000"
              />
            );
          })}
          <circle cx="150" cy="150" r="44" fill="#000" />
        </mask>
      </defs>

      <g className="reel-wheel-spin">
        {/* The wound film, behind the flange and visible through the cutouts. */}
        <circle cx="150" cy="150" r="126" fill="url(#reel-core)" />
        {WINDINGS.map((r) => (
          <circle
            key={r}
            cx="150"
            cy="150"
            r={r}
            fill="none"
            stroke="#efe9df"
            strokeOpacity="0.07"
            strokeWidth="1.5"
          />
        ))}

        <circle cx="150" cy="150" r="142" fill="url(#reel-metal)" mask="url(#reel-flange-mask)" />

        {/* Rim lip, so the flange has an edge rather than ending flat. */}
        <circle
          cx="150"
          cy="150"
          r="141"
          fill="none"
          stroke="#f2efe9"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
      </g>

      <circle cx="150" cy="150" r="44" fill="url(#reel-hub-metal)" />
      <circle
        cx="150"
        cy="150"
        r="44"
        fill="none"
        stroke="#0d0a08"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <image href="/assets/brand/mark-64.png" x="126" y="126" width="48" height="48" />
    </svg>
  );
}
