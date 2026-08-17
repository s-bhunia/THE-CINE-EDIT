import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const DRAG_THRESHOLD_PX = 4;

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  const [dragging, setDragging] = useState(false);
  const detach = useRef<(() => void) | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const node = ref.current;
      if (!node || event.pointerType !== 'mouse' || event.button !== 0) return;
      if (node.scrollWidth <= node.clientWidth) return;

      event.preventDefault();

      const startX = event.clientX;
      const startScrollLeft = node.scrollLeft;
      const pointerId = event.pointerId;
      let moved = false;

      const blockNativeDrag = (dragEvent: Event) => dragEvent.preventDefault();

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const delta = moveEvent.clientX - startX;
        if (Math.abs(delta) > DRAG_THRESHOLD_PX) moved = true;
        node.scrollLeft = startScrollLeft - delta;
        moveEvent.preventDefault();
      };

      const onClickCapture = (clickEvent: MouseEvent) => {
        if (!moved) return;
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        node.removeEventListener('dragstart', blockNativeDrag);
        detach.current = null;
        setDragging(false);
        window.setTimeout(() => {
          node.removeEventListener('click', onClickCapture, { capture: true });
        }, 0);
      };

      function onUp(upEvent: PointerEvent) {
        if (upEvent.pointerId !== pointerId) return;
        cleanup();
      }

      node.addEventListener('dragstart', blockNativeDrag);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      node.addEventListener('click', onClickCapture, { capture: true });

      detach.current = cleanup;
      setDragging(true);
    },
    [ref],
  );

  useEffect(() => () => detach.current?.(), []);

  return { dragging, onPointerDown };
}
