import { site } from '@/content/site';
import { SlateForm } from '@/routes/contact/SlateForm';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';
import { useInView } from '@/hooks/useInView';
import { MobileSectionHead } from './MobileSectionHead';

export function MobileContact() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id="contact"
      className="scroll-mt-20 py-16 border-t border-ink-line"
    >
      <MobileSectionHead slate="SEQ 08 — THE SLATE" title="Ready to cut." shown={inView}>
        For bookings, rate cards, or technical questions about remote proxy workflows,
        submit the slate.
      </MobileSectionHead>

      <div className="mt-8 px-6 flex flex-col gap-8">
        <div className="metadata text-safelight border border-safelight px-4 py-2 self-start rounded-sm text-xs">
          {site.availability}
        </div>

        <div className="flex flex-col gap-3 border-y border-ink-line py-5 metadata text-sm">
          <span className="text-bone-dim uppercase text-[10px] tracking-widest">
            Prefer to message
          </span>
          <WhatsAppLink label={`WhatsApp — ${site.contact.whatsapp}`} />
          <a
            href={site.contact.phoneLink}
            className="text-bone-dim hover:text-safelight transition-colors"
          >
            {site.contact.phone}
          </a>
        </div>

        <SlateForm />
      </div>
    </section>
  );
}
