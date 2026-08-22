import { useEffect } from 'react';

let openCount = 0;
let restore: (() => void) | null = null;

/**
 * Declares that a full-screen overlay owns the viewport: freezes the page
 * behind it and takes the site header out of the way. The header's right-hand
 * nav sat in exactly the spot the lightbox puts its ESC control, so the two
 * read as one overlapping pile.
 *
 * Reference counted, so a player opened from underneath another overlay cannot
 * unlock the page on the way out.
 */
export function useModalLayer() {
  useEffect(() => {
    openCount += 1;

    if (openCount === 1) {
      const root = document.documentElement;
      const body = document.body;
      const previousOverflow = body.style.overflow;
      const previousPadding = body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - root.clientWidth;

      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
      root.setAttribute('data-modal-open', '');

      restore = () => {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPadding;
        root.removeAttribute('data-modal-open');
      };
    }

    return () => {
      openCount -= 1;
      if (openCount === 0) {
        restore?.();
        restore = null;
      }
    };
  }, []);
}
