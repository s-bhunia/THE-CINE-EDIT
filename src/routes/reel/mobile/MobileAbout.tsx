import { site } from '@/content/site';
import { about } from '@/content/about';
import { RiseIn } from '@/components/ui/RiseIn';
import { SocialRow } from '@/components/ui/SocialRow';
import { useInView } from '@/hooks/useInView';
import { MobileSectionHead } from './MobileSectionHead';

export function MobileAbout() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} id="about" className="scroll-mt-20 py-16 border-t border-ink-line">
      <MobileSectionHead slate="SEQ 07 — THE EDITOR" title={site.editor} shown={inView} />

      <div className="mt-8 px-6 flex flex-col gap-8">
        <RiseIn
          shown={inView}
          delayMs={200}
          variant="gate"
          className="aspect-[4/5] bg-ink-raise overflow-hidden"
        >
          <img
            src="/assets/about/portrait-1080.avif"
            srcSet="/assets/about/portrait.avif 640w, /assets/about/portrait-1080.avif 1080w"
            sizes="100vw"
            alt={site.editor}
            width={1080}
            height={1350}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </RiseIn>

        <div className="flex flex-col gap-5 text-bone/90">
          {about.bio.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <RiseIn shown={inView} delayMs={340}>
          <SocialRow />
        </RiseIn>

        <RiseIn shown={inView} delayMs={420}>
          <blockquote>
            <p className="font-display text-2xl text-bone leading-tight tracking-tight">
              &ldquo;{about.philosophy}&rdquo;
            </p>
          </blockquote>
        </RiseIn>

        <details className="border-t border-ink-line pt-5">
          <summary className="metadata text-[11px] uppercase tracking-widest text-bone-dim cursor-pointer hover:text-safelight transition-colors">
            Studio specifications
          </summary>
          <div className="grid grid-cols-1 gap-y-3 metadata text-xs mt-5">
            {Object.entries(about.gear).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-4 border-b border-ink-raise pb-2"
              >
                <span className="text-bone-dim flex-none">{key}</span>
                <span className="text-bone text-right">{value}</span>
              </div>
            ))}
          </div>
        </details>

        <details className="border-t border-ink-line pt-5">
          <summary className="metadata text-[11px] uppercase tracking-widest text-bone-dim cursor-pointer hover:text-safelight transition-colors">
            For producers
          </summary>
          <div className="grid grid-cols-1 gap-y-3 metadata text-xs mt-5">
            {Object.entries(about.producerNotes).map(([key, value]) => (
              <div key={key} className="border-b border-ink-raise pb-2">
                <span className="text-bone-dim block mb-1">{key}</span>
                <span className="text-bone">{value}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
