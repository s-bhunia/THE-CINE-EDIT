import { process } from '@/content/process';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { MobileSectionHead } from './MobileSectionHead';

/** Gap between one beat landing and the next starting. */
const BEAT_STAGGER_MS = 260;

export function MobileProcess() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id="process"
      className="scroll-mt-20 py-16 border-t border-ink-line"
    >
      <MobileSectionHead
        slate="SEQ 02 — PROCESS"
        title="How the cut happens"
        shown={inView}
      >
        Three beats, ingest to delivery.
      </MobileSectionHead>

      {/* Stacked rather than swiped: the beats are a sequence, so they arrive
          as one — each gate wiping open after the one above it. */}
      <div className="mt-10 px-6 flex flex-col gap-12">
        {process.map((beat, index) => {
          const delay = 200 + index * BEAT_STAGGER_MS;
          return (
            <article key={beat.id} className="flex flex-col gap-4">
              <RiseIn
                shown={inView}
                delayMs={delay}
                variant="gate"
                className="aspect-video bg-ink-raise overflow-hidden relative"
              >
                <img
                  src={beat.image}
                  alt={beat.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-0 left-0 metadata text-[10px] tabular-nums bg-ink/85 text-safelight px-2 py-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </RiseIn>

              <RiseIn shown={inView} delayMs={delay + 220}>
                <h3 className="font-display text-xl text-bone">{beat.label}</h3>
                <p className="text-bone-dim text-sm mt-2">{beat.body}</p>
              </RiseIn>
            </article>
          );
        })}
      </div>
    </section>
  );
}
