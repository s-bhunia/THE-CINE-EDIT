import { site } from '@/content/site';
import { cn } from '@/lib/cn';
import { WhatsAppGlyph, WHATSAPP_GREEN } from '@/components/ui/SocialGlyphs';
import { InstagramGlyph } from '@/components/ui/InstagramGlyph';

/** Instagram has no single flat brand colour; this is the mid-magenta of the gradient. */
const INSTAGRAM_PINK = '#e1306c';

const LINKS = [
  {
    id: 'whatsapp',
    href: site.contact.whatsappLink,
    label: 'WhatsApp',
    accessibleLabel: `Message on WhatsApp — ${site.contact.whatsapp}`,
    color: WHATSAPP_GREEN,
    Glyph: WhatsAppGlyph,
  },
  {
    id: 'instagram',
    href: site.contact.instagramLink,
    label: site.contact.instagram,
    accessibleLabel: `The Cine Edit on Instagram — ${site.contact.instagram}`,
    color: INSTAGRAM_PINK,
    Glyph: InstagramGlyph,
  },
];

/** Reach-out row for the About page, in place of the floating corner button. */
export function SocialRow({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-3', className)}>
      {LINKS.map(({ id, href, label, accessibleLabel, color, Glyph }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={accessibleLabel}
            className="metadata group/social inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-2 text-xs uppercase tracking-widest text-bone transition-colors hover:border-bone focus-visible:outline-1 focus-visible:outline-bone"
          >
            <span
              style={{ color }}
              className="inline-flex transition-transform duration-120 group-hover/social:scale-110 motion-reduce:transition-none motion-reduce:group-hover/social:scale-100"
            >
              <Glyph size={18} />
            </span>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
