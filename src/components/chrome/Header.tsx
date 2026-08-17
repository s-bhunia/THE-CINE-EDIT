import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { site } from '@/content/site';

const SCRIM_AFTER_PX = 24;

const LINKS = [
  { to: '/work', label: 'Selects' },
  { to: '/stills', label: 'Stills' },
  { to: '/experience', label: 'Timeline' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const linkClassName =
  'metadata uppercase tracking-widest text-sm hover:text-safelight transition-colors';

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

  const opaque = scrolled || menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 text-bone px-6 py-6 transition-colors duration-120 ${
        opaque
          ? 'bg-ink border-b border-ink-line'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex justify-between items-center max-w-[1920px] mx-auto">
        <NavLink to="/" className={linkClassName} onClick={() => setMenuOpen(false)}>
          {site.name}
        </NavLink>

        <nav className="hidden md:flex gap-8">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClassName}>
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
