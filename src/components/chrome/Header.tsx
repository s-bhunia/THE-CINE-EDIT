import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { scrollToTop } from '@/lib/scroll';
import { Wordmark } from '@/components/chrome/Wordmark';

const SCRIM_AFTER = '24px';
/** Far enough in that a nudge of the wheel does not shrink the title. */
const DOCK_AFTER = '25vh';

/**
 * Every link routes, at every width. The home page stages its own run of these
 * sections, but the full set of each lives on its own page — the panels are the
 * trailer, these are the feature.
 */
const LINKS = [
  { to: '/work', label: 'Selects' },
  { to: '/stills', label: 'Stills' },
  { to: '/experience', label: 'Timeline' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const linkClassName =
  'metadata uppercase tracking-widest text-sm hover:text-safelight transition-colors';

const desktopLinkClassName = `${linkClassName} relative z-10 px-3 py-1.5`;

interface IndicatorRect {
  left: number;
  width: number;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPast(SCRIM_AFTER);
  const pastHero = useScrolledPast(DOCK_AFTER);

  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const { pathname } = useLocation();

  const syncIndicator = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('[aria-current="page"]');
    if (!(active instanceof HTMLElement)) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, []);

  useLayoutEffect(() => {
    syncIndicator();
  }, [pathname, syncIndicator]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncIndicator);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [syncIndicator]);

  const isHome = pathname === '/';
  const expanded = isHome && !pastHero;

  /*
   * On the home page the scrim waits for the wordmark rather than for the first
   * 24px of scroll: filling the bar in while the title is still at full size
   * paints a very thick slab across the top. The delay below lets the resize
   * finish first, and is dropped on the way back so the bar clears out of the
   * way before the title grows again.
   */
  const opaque = (isHome ? pastHero : scrolled) || menuOpen;
  const scrimDelay = isHome && opaque && !menuOpen ? 'delay-[420ms]' : 'delay-0';

  return (
    <header
      data-site-header
      className={`fixed top-0 left-0 right-0 z-50 text-bone px-6 py-6 transition-colors duration-120 ${scrimDelay} ${
        opaque
          ? 'bg-ink border-b border-ink-line'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex justify-between items-center max-w-[1920px] mx-auto">
        <NavLink
          to="/"
          className={linkClassName}
          onClick={() => {
            setMenuOpen(false);
            // Already home, so the router sees no path change and would leave
            // the visitor wherever down the run they had scrolled to.
            if (pathname === '/') scrollToTop();
          }}
        >
          <Wordmark expanded={expanded} />
        </NavLink>

        <nav ref={navRef} className="hidden md:flex relative gap-3">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 rounded-[2px] bg-safelight motion-safe:transition-[transform,width,opacity] motion-safe:duration-280 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: indicator ? `${indicator.width}px` : 0,
              transform: `translateX(${indicator?.left ?? 0}px)`,
              opacity: indicator ? 1 : 0,
            }}
          />
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${desktopLinkClassName} ${isActive ? 'text-ink hover:text-ink' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden metadata uppercase tracking-widest text-sm hover:text-safelight transition-colors"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="md:hidden flex flex-col gap-6 px-2 pt-10 pb-4">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClassName}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
