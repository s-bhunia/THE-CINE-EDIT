import { useState } from 'react';
import { Link } from 'react-router';
import type { CSSProperties } from 'react';
import { gridWorks, GRID_COLUMNS, GRID_ROWS, works } from '@/content/works';
import { MicroPreview } from '@/components/media/MicroPreview';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { useIsPhone } from '@/hooks/useIsPhone';
import { usePointerPan } from './usePointerPan';

/** How far past the frame the board extends. The excess is the pan travel. */
const BOARD_SCALE = 1.35;

const TOUCH_COLUMNS = 2;
const TOUCH_ROWS = 3;

const MAX_DISTANCE = Math.hypot((GRID_COLUMNS - 1) / 2, (GRID_ROWS - 1) / 2);

/**
 * How far a tile sits from the middle of the board, 0 to 1. Baked in at render
 * from the tile's own coordinates and handed to CSS, so softening the outer
 * tiles costs nothing on the pointer path.
 */
function edgeness(index: number) {
  const dx = Math.abs((index % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2);
  const dy = Math.abs(Math.floor(index / GRID_COLUMNS) - (GRID_ROWS - 1) / 2);
  return +(Math.hypot(dx, dy) / MAX_DISTANCE).toFixed(3);
}

export function SelectsScene() {
  const { allowVideoPreview, allowMotion } = useMediaCapability();
  const isPhone = useIsPhone();
  const [hovered, setHovered] = useState<number | null>(null);

  /*
   * Touch has no cursor to pan with, and a scrollable board inside a pinned
   * panel would swallow the page scroll — so it gets a still, smaller board
   * that fits the viewport, posters only. The full set is a tap away.
   */
  const panned = allowMotion && !isPhone;
  const tiles = panned ? gridWorks : gridWorks.slice(0, TOUCH_COLUMNS * TOUCH_ROWS);
  const { frameRef, boardRef } = usePointerPan({
    enabled: panned,
    columns: GRID_COLUMNS,
    rows: GRID_ROWS,
    onHover: setHovered,
  });

  return (
    <div ref={frameRef} className="relative h-full w-full">
      <div
        ref={boardRef}
        className={
          panned
            ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid gap-3 md:gap-4'
            : 'grid h-full w-full gap-2 p-3 pt-20 pb-24'
        }
        style={
          panned
            ? {
                width: `${BOARD_SCALE * 100}%`,
                height: `${BOARD_SCALE * 100}%`,
                gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
              }
            : {
                gridTemplateColumns: `repeat(${TOUCH_COLUMNS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${TOUCH_ROWS}, minmax(0, 1fr))`,
              }
        }
      >
        {tiles.map((work, index) => (
          <div
            key={work.slug}
            aria-hidden="true"
            data-hot={panned && hovered === index ? 'true' : 'false'}
            className="select-tile relative overflow-hidden bg-ink-raise"
            style={panned ? ({ '--edge': edgeness(index) } as CSSProperties) : undefined}
          >
            <MicroPreview
              id={`grid-${work.slug}`}
              previewSrc={work.previewSources?.h264 || ''}
              posterSrc={work.posterAvif}
              trigger="controlled"
              wanted={panned && allowVideoPreview && hovered === index}
            />
          </div>
        ))}
      </div>

      {/* Lights whatever the cursor is over. Reads --mx/--my, which the pan
          hook writes on the frame; inheritance carries them down to here. */}
      {panned && (
        <div
          aria-hidden="true"
          className="select-vignette pointer-events-none absolute inset-0"
        />
      )}

      {/*
       * The tiles are decorative, so the whole board is one control with one
       * name rather than twelve competing ones.
       */}
      {/* Both labels ride at the top: the bottom corners belong to the grade
          wheels, the timecode and the WhatsApp button on every panel. */}
      <Link
        to="/work"
        aria-label={`See all work — ${works.length} films`}
        className="group absolute inset-0 z-20 flex items-start justify-between gap-4 px-6 md:px-10 pt-24 md:pt-28 focus-visible:outline-2 focus-visible:outline-safelight focus-visible:-outline-offset-4"
      >
        <span className="metadata rounded-sm bg-ink/70 px-2 py-1 text-xs md:text-sm text-bone-dim uppercase tracking-widest">
          SEQ 02 — SELECTS — 24 FPS
        </span>
        <span className="metadata text-sm md:text-base text-bone border border-ink-line bg-ink/80 px-4 py-2 rounded-sm transition-colors group-hover:border-safelight group-hover:text-safelight">
          All work ▸
        </span>
      </Link>
    </div>
  );
}
