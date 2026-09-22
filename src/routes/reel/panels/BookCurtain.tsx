import { Link } from 'react-router';
import { site } from '@/content/site';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { CURTAIN_BAND, PANEL_BODY } from '@/routes/reel/curtain/Act';
import { cn } from '@/lib/cn';
import { Slate } from './Slate';

export function BookCurtain() {
  const { ref, inView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: CURTAIN_BAND,
  });

  return (
    <div ref={ref} className={cn(PANEL_BODY, 'gap-8 md:gap-10')}>
      <Slate shown={inView}>SEQ 07 — THE SLATE</Slate>

      <RiseIn shown={inView} delayMs={80} variant="gate">
        <Link
          to="/contact"
          className="font-display text-5xl md:text-7xl lg:text-8xl text-bone hover:text-safelight transition-colors tracking-tight inline-block"
        >
          Book the slot ▸
        </Link>
      </RiseIn>

      <RiseIn shown={inView} delayMs={180}>
        <span className="metadata text-sm text-safelight">{site.availability}</span>
      </RiseIn>

      <RiseIn shown={inView} delayMs={240}>
        <p className="text-bone-dim max-w-[46ch]">
          Tell me the date and the shape of the day. I will come back with what the edit
          needs and what it costs.
        </p>
      </RiseIn>
    </div>
  );
}
