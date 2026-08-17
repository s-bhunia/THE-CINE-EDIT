declare global {
  interface Window {
    plausible?: (
      event: string,
      opts?: { props?: Record<string, string | number> },
    ) => void;
  }
}

function isEnabled() {
  return typeof window !== 'undefined' && typeof window.plausible === 'function';
}

export function initAnalytics() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain || typeof document === 'undefined') return;
  if (document.querySelector('script[data-plausible]')) return;

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.dataset.plausible = 'true';
  script.src = 'https://plausible.io/js/script.manual.pageview-props.js';
  document.head.appendChild(script);
}

export function trackPageview(path: string) {
  if (!isEnabled()) return;
  window.plausible!('pageview', { props: { path } });
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (!isEnabled()) return;
  window.plausible!(name, props ? { props } : undefined);
}

export const analyticsEvents = {
  reelPlay: () => trackEvent('Reel Play'),
  reelClose: (watchedSeconds: number) =>
    trackEvent('Reel Close', { watchedSeconds: Math.round(watchedSeconds) }),
  enquirySubmit: (eventType: string) => trackEvent('Enquiry Submit', { eventType }),
  enquiryError: () => trackEvent('Enquiry Error'),
  caseStudyShare: (slug: string) => trackEvent('Case Study Share', { slug }),
};
