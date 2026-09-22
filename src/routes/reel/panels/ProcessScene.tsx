import { process } from '@/content/process';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { CURTAIN_BAND, PANEL_BODY } from '@/routes/reel/curtain/Act';
import { cn } from '@/lib/cn';
import { Slate } from './Slate';

export function ProcessScene() {
  const { ref, inView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: CURTAIN_BAND,
  });

  return (
    <div ref={ref} className={cn(PANEL_BODY, 'gap-8 md:gap-12')}>
      <div className="flex flex-wrap items-center gap-3">
        <img
          src="/assets/brand/mark-64.png"
          alt=""
          width={64}
          height={67}
          className="h-5 w-auto flex-none"
        />
        <Slate shown={inView}>SEQ 06 — PROCESS — 24 FPS</Slate>
      </div>

      <RiseIn shown={inView} delayMs={80} variant="gate">
        <h2 className="font-display text-3xl md:text-5xl text-bone leading-tight tracking-tight">
          How the cut happens
        </h2>
      </RiseIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {process.map((beat, index) => (
          <RiseIn key={beat.id} shown={inView} delayMs={160 + index * 110}>
            <article className="flex flex-col gap-4">
              <div className="aspect-video bg-ink-raise overflow-hidden rounded-sm">
                <img
                  src={beat.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-xl md:text-2xl text-bone mb-2">
                  <span className="metadata text-safelight text-sm mr-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {beat.label}
                </h3>
                <p className="text-sm text-bone-dim leading-relaxed max-w-[40ch]">
                  {beat.body}
                </p>
              </div>
            </article>
          </RiseIn>
        ))}
      </div>
    </div>
  );
}
