import { useLocation } from 'react-router';
import { site } from '@/content/site';
import { WhatsAppGlyph, WHATSAPP_GREEN } from '@/components/ui/SocialGlyphs';

/**
 * Routes that carry their own social row and so do not need the floating button
 * duplicating it in the corner.
 */
const SUPPRESSED_PATHS = ['/about'];

export function WhatsAppFab() {
  const { pathname } = useLocation();
  if (SUPPRESSED_PATHS.includes(pathname)) return null;

  return (
    <a
      href={site.contact.whatsappLink}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Message The Cine Edit on WhatsApp — ${site.contact.whatsapp}`}
      className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition-transform duration-120 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{ backgroundColor: WHATSAPP_GREEN }}
    >
      <WhatsAppGlyph size={26} />
    </a>
  );
}
