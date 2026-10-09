import { useEffect, useRef } from 'react';

/** Matches Lenis's own lerp, so the board and the page feel like one motion. */
const LERP = 0.085;
const SETTLE_PX = 0.15;

interface PointerPanOptions {
  enabled: boolean;
  columns: number;
  rows: number;
  /** Fires only when the tile under the cursor changes. */
  onHover?: (index: number | null) => void;
}

/**
 * Drifts an oversized board against the pointer inside a clipped frame, and
 * reports which tile the cursor is over.
 *
 * Hover is worked out here, from the frame, rather than with per-tile handlers:
 * the panel is covered by a full-bleed link so that the whole board is one
 * control, and that link swallows enter/leave on the tiles beneath it.
 * pointermove bubbles up to the frame, so this is the one place that still
 * sees the cursor.
 *
 * One rAF, one transform write per frame, and the loop stops itself once the
 * board has caught up — it is not running while the pointer is still.
 */
export function usePointerPan({ enabled, columns, rows, onHover }: PointerPanOptions) {
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  useEffect(() => {
    const frame = frameRef.current;
    const board = boardRef.current;
    if (!enabled || !frame || !board) return;

    const state = {
      nx: 0,
      ny: 0,
      tx: 0,
      ty: 0,
      px: 0,
      py: 0,
      hover: null as number | null,
      raf: 0,
    };

    const setHover = (next: number | null) => {
      if (next === state.hover) return;
      state.hover = next;
      onHoverRef.current?.(next);
    };

    // Measured on pointer movement and resize, never inside the frame loop,
    // so a frame is pure writes and never forces a layout.
    const box = { left: 0, top: 0, width: 0, height: 0, boardW: 0, boardH: 0 };
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      box.left = rect.left;
      box.top = rect.top;
      box.width = rect.width;
      box.height = rect.height;
      box.boardW = board.offsetWidth;
      box.boardH = board.offsetHeight;
    };

    const tick = () => {
      state.raf = 0;
      // How far the board hangs past the frame, halved: that is the travel.
      const maxX = Math.max(0, (box.boardW - box.width) / 2);
      const maxY = Math.max(0, (box.boardH - box.height) / 2);

      const goalX = -state.nx * maxX;
      const goalY = -state.ny * maxY;
      state.tx += (goalX - state.tx) * LERP;
      state.ty += (goalY - state.ty) * LERP;

      board.style.transform = `translate3d(${state.tx.toFixed(2)}px, ${state.ty.toFixed(2)}px, 0)`;

      // Custom properties inherit, so writing them on the frame is enough for
      // anything inside it — no second ref, no second element to keep in step.
      frame.style.setProperty('--mx', `${(((state.nx + 1) / 2) * 100).toFixed(1)}%`);
      frame.style.setProperty('--my', `${(((state.ny + 1) / 2) * 100).toFixed(1)}%`);

      // The board is centred in the frame, so its edges are known from the
      // cached sizes plus the pan just written.
      const boardLeft = box.left + (box.width - box.boardW) / 2 + state.tx;
      const boardTop = box.top + (box.height - box.boardH) / 2 + state.ty;
      const col = Math.floor(((state.px - boardLeft) / box.boardW) * columns);
      const row = Math.floor(((state.py - boardTop) / box.boardH) * rows);
      const inside = col >= 0 && col < columns && row >= 0 && row < rows;
      setHover(inside ? row * columns + col : null);

      if (Math.hypot(goalX - state.tx, goalY - state.ty) > SETTLE_PX) {
        state.raf = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      measure();
      state.nx = ((event.clientX - box.left) / box.width) * 2 - 1;
      state.ny = ((event.clientY - box.top) / box.height) * 2 - 1;
      state.px = event.clientX;
      state.py = event.clientY;
      start();
    };

    const onPointerLeave = () => {
      state.nx = 0;
      state.ny = 0;
      state.px = Number.NaN;
      state.py = Number.NaN;
      setHover(null);
      start();
    };

    frame.addEventListener('pointermove', onPointerMove, { passive: true });
    frame.addEventListener('pointerleave', onPointerLeave);

    return () => {
      frame.removeEventListener('pointermove', onPointerMove);
      frame.removeEventListener('pointerleave', onPointerLeave);
      if (state.raf) cancelAnimationFrame(state.raf);
      board.style.transform = '';
    };
  }, [enabled, columns, rows]);

  return { frameRef, boardRef };
}
