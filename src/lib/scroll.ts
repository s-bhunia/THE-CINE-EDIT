import type Lenis from 'lenis';

/**
 * Lenis owns the window scroll position whenever it is running, so anything that
 * wants to move the page has to go through it — `window.scrollTo` and
 * `scrollIntoView` get smoothly animated back to where they were. useLenis
 * registers the live instance here so in-page navigation can reach it without
 * threading a ref through the tree.
 */
let instance: Lenis | null = null;

export function registerLenis(next: Lenis | null) {
  instance = next;
}

export function scrollToTop() {
  if (instance) {
    instance.scrollTo(0, { immediate: true, force: true });
    return;
  }
  window.scrollTo(0, 0);
}

export function scrollToSection(selector: string, offset = -72) {
  const node = document.querySelector(selector);
  if (!node) return false;

  if (instance) {
    instance.scrollTo(node as HTMLElement, { offset, duration: 0.9, force: true });
  } else {
    const top = node.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  return true;
}
