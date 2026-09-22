import { experience } from '@/content';
import { RiseIn } from '@/components/ui/RiseIn';
import { useInView } from '@/hooks/useInView';
import { PhoneSectionHead } from './PhoneSectionHead';

const TRACK_LABELS: Record<string, string> = {
  V2: 'V2 — FILMS',
  V1: 'V1 — WEDDINGS',
  A1: 'A1 — AWARDS',
  FX: 'FX — TOOLS',
};

const CLIP_STAGGER_MS = 130;

function yearLabel(start: number, end: number | undefined) {
  const from = Math.floor(start);
  if (end === undefined) return `${from} — PRESENT`;
  const to = Math.floor(end);
  return from === to ? `${from}` : `${from} — ${to}`;
}

export function PhoneTimeline() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id="experience"
      className="scroll-mt-20 py-16 border-t border-ink-line"
    >
      <PhoneSectionHead slate="SEQ 05 — EXPERIENCE" title="Timeline" shown={inView}>
        The desktop version of this is a timeline you scrub. Here it is as clips stacked
        on their tracks.
      </PhoneSectionHead>

      <div className="mt-8 px-6 flex flex-col gap-3">
        {experience.map((entry, index) => (
          <RiseIn key={entry.id} shown={inView} delayMs={220 + index * CLIP_STAGGER_MS}>
            <article className="bg-ink-raise border-l-2 border-safelight p-4 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="metadata text-[10px] uppercase tracking-widest text-safelight">
                  {TRACK_LABELS[entry.track] ?? entry.track}
                </span>
                <span className="metadata text-[10px] text-bone-dim tabular-nums">
                  {yearLabel(entry.startYear, entry.endYear)}
                </span>
              </div>
              <h3 className="font-display text-xl text-bone leading-tight">
                {entry.title}
              </h3>
              <span className="metadata text-[11px] text-bone-dim">{entry.role}</span>
              <p className="text-bone/80 text-sm mt-1">{entry.detail}</p>
            </article>
          </RiseIn>
        ))}
      </div>
    </section>
  );
}
