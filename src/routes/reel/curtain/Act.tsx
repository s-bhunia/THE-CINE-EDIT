import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CurtainDressing } from './CurtainDressing';

/**
 * The staging primitives for the home page. See the `.act` block in theme.css
 * for how the choreography actually works — these are only the shape of it.
 *
 * An act is one scene plus the curtain that covers it:
 *
 *   <Act>
 *     <Scene>…</Scene>
 *     <Curtain>…</Curtain>
 *   </Act>
 *
 * Order matters and the pair is not optional: the curtain is what hands the
 * viewport to the next act.
 */
/**
 * rootMargin for reveals that live inside a curtain. A pinned curtain never
 * stops intersecting the viewport, so a plain observer would latch in as it
 * arrives and never report leaving. Keyed to a centre band instead, it enters
 * as the curtain covers mid-screen and leaves as the curtain lifts past it —
 * which is what makes the text play backwards on the way up.
 */
export const CURTAIN_BAND = '-45% 0px -45% 0px';

/**
 * Standard inset for panel content. The top clears the fixed header; the bottom
 * clears the corner furniture, which is permanent on this page — grade wheels
 * and timecode at bottom left, the WhatsApp button at bottom right.
 */
export const PANEL_BODY =
  'relative z-10 h-full flex flex-col justify-center px-6 md:px-10 pt-24 pb-28 md:pb-24 max-w-[1920px] mx-auto';

export function Act({ children }: { children: ReactNode }) {
  return <section className="act">{children}</section>;
}

interface SceneProps {
  children: ReactNode;
  /**
   * Viewport-heights the scene holds uncovered before its curtain starts to
   * rise. Without it the next curtain begins covering roughly as the previous
   * one finishes lifting, and the scene — which is the actual work — never gets
   * a clear look. Costs page length, so it is per-act rather than fixed.
   */
  hold?: number;
  className?: string;
}

export function Scene({ children, hold = 1.5, className }: SceneProps) {
  return (
    <>
      <div className={cn('pin scene overflow-hidden', className)}>{children}</div>
      <div className="dwell" style={{ '--dwell': hold } as CSSProperties} />
    </>
  );
}

interface CurtainProps {
  children: ReactNode;
  /** Viewport-heights the curtain holds for once it has covered the scene. */
  dwell?: number;
  className?: string;
}

export function Curtain({ children, dwell = 0.6, className }: CurtainProps) {
  return (
    <>
      <div className={cn('pin curtain overflow-hidden', className)}>
        {/* Dressed here rather than per panel, so every curtain gets the same
            depth without each one remembering to ask for it. */}
        <CurtainDressing />
        {children}
      </div>
      <div className="dwell" style={{ '--dwell': dwell } as CSSProperties} />
    </>
  );
}
