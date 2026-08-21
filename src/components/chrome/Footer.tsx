import { site } from '@/content/site';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';

export function Footer() {
  return (
    <footer className="border-t border-ink-line px-6 py-12 metadata text-sm text-bone-dim">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-bone">{site.name}</span>
          <span>{site.editor}</span>
        </div>

        <div className="flex flex-col gap-1">
          <a
            href={site.contact.phoneLink}
            className="hover:text-safelight transition-colors"
          >
            {site.contact.phone}
          </a>
          <a
            href={`mailto:${site.contact.email}`}
            className="hover:text-safelight transition-colors"
          >
            {site.contact.email}
          </a>
          <WhatsAppLink label={site.contact.whatsapp} />
          <a
            href={site.contact.locationLink}
            className="hover:text-safelight transition-colors"
          >
            {site.contact.location}
          </a>
        </div>

        <div className="flex flex-col gap-1 md:text-right">
          <span className="text-safelight">{site.availability}</span>
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
