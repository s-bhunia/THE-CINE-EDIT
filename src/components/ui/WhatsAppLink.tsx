import { site } from '@/content/site';
import { cn } from '@/lib/cn';
import { WhatsAppGlyph, WHATSAPP_GREEN } from '@/components/ui/SocialGlyphs';

interface WhatsAppLinkProps {
  label?: string;
  className?: string;
}

export function WhatsAppLink({ label = 'WhatsApp', className = '' }: WhatsAppLinkProps) {
  return (
    <a
      href={site.contact.whatsappLink}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'group/wa inline-flex items-center gap-2 -mx-1 px-1 py-1 rounded-[2px] text-bone-dim transition-colors hover:text-[#25d366] focus-visible:outline-1 focus-visible:outline-[#25d366]',
        className,
      )}
    >
      <span
        style={{ color: WHATSAPP_GREEN }}
        className="inline-flex transition-transform duration-120 group-hover/wa:scale-110 motion-reduce:transition-none motion-reduce:group-hover/wa:scale-100"
      >
        <WhatsAppGlyph size={18} />
      </span>
      <span>{label}</span>
    </a>
  );
}
