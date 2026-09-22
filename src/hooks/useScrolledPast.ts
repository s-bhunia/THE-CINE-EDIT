import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `offset` from the top of the document.
 *
 * A throwaway sentinel plus one IntersectionObserver rather than a scroll
 * listener, so it costs nothing per frame — and it works whether or not Lenis
 * is driving, since it only ever asks about layout position.
 */
export function useScrolledPast(offset: string) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = `position:absolute;top:${offset};left:0;width:1px;height:1px;pointer-events:none;`;
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(([entry]) => setPast(!entry?.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [offset]);

  return past;
}
