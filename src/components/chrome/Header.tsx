import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { site } from '@/content/site';
import { useIsPhone } from '@/hooks/useIsPhone';
import { scrollToSection, scrollToTop } from '@/lib/scroll';

const SCRIM_AFTER_PX = 24;

/**
 * `to` is the standalone route; `section` is the matching anchor on the phone
 * single-page layout. On a phone the menu scrolls within that page instead of
 * navigating away, which is the whole point of stitching it together.
 */
const LINKS = [
  { to: '/work', section: '#work', label: 'Selects' },
  { to: '/stills', section: '#stills', label: 'Stills' },
  { to: '/experience', section: '#experience', label: 'Timeline' },
  { to: '/about', section: '#about', label: 'About' },
  { to: '/contact', section: '#contact', label: 'Contact' },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = `position:absolute;top:${SCRIM_AFTER_PX}px;left:0;width:1px;height:1px;pointer-events:none;`;
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry?.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const { pathname } = useLocation();
  const isPhone = useIsPhone();
  const onSinglePage = isPhone && pathname === '/';

  // On the phone single page the target already exists, so scroll straight to it
  // and skip the route change entirely; the URL still gets the hash so the entry
  // is shareable and Back behaves.
  const jumpToSection = useCallback(
    (section: string) => (event: React.MouseEvent) => {
      if (!onSinglePage) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      if (!scrollToSection(section)) return;
      event.preventDefault();
      window.history.replaceState(null, '', section);
      setMenuOpen(false);
    },
    [onSinglePage],
  );

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

  const opaque = scrolled || menuOpen;

  return (
    <header
      data-site-header
      className={`fixed top-0 left-0 right-0 z-50 text-bone px-6 py-6 transition-colors duration-120 ${
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
            // Already on the single page, so the router sees no path change and
            // would leave the visitor wherever they had scrolled to.
            if (onSinglePage) scrollToTop();
          }}
        >
          <span className="inline-flex items-center gap-2.5">
            <img
              src="/assets/brand/mark-64.png"
              alt=""
              width={64}
              height={67}
              className="h-4 w-auto flex-none"
            />
            {site.name}
          </span>
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
              to={onSinglePage ? `/${link.section}` : link.to}
              className={linkClassName}
              onClick={(event) => {
                jumpToSection(link.section)(event);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
