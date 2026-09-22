import { site } from '@/content/site';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { CountUp } from '@/components/ui/CountUp';
import { CURTAIN_BAND, PANEL_BODY } from '@/routes/reel/curtain/Act';
import { cn } from '@/lib/cn';
import { Slate } from './Slate';

const STATS = [
  { label: 'Projects Delivered', value: site.stats.projectsDelivered },
  { label: 'Happy Clients', value: site.stats.clients },
];

export function WhyCurtain() {
  const { ref, inView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: CURTAIN_BAND,
  });

  return (
    <div ref={ref} className={cn(PANEL_BODY, 'gap-10 md:gap-14')}>
      <Slate shown={inView}>SEQ 01 — WHY — 24 FPS</Slate>

      <RiseIn shown={inView} delayMs={80} variant="gate">
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-bone leading-[1.05] tracking-tight max-w-[18ch]">
          Why{' '}
          <span className="inline-flex items-baseline gap-[0.25em] whitespace-nowrap">
            <img
              src="/assets/brand/mark-64.png"
              alt=""
              width={64}
              height={67}
              className="h-[0.78em] w-auto flex-none translate-y-[0.06em]"
            />
            <span className="font-mono tracking-[0.02em]">{site.name}</span>
          </span>
        </h2>
      </RiseIn>

      <div className="grid gap-8 md:gap-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="max-w-[52ch] flex flex-col gap-6">
          <RiseIn shown={inView} delayMs={160}>
            <p className="font-display text-2xl md:text-3xl text-bone leading-tight tracking-tight">
              {site.positioning.statement}
            </p>
          </RiseIn>

          <RiseIn shown={inView} delayMs={240}>
            <p className="text-bone-dim leading-relaxed">{site.positioning.answer}</p>
          </RiseIn>

          <RiseIn shown={inView} delayMs={300}>
            <span className="metadata text-xs text-bone-dim uppercase tracking-widest">
              {site.positioning.attribution}
            </span>
          </RiseIn>
        </div>

        <div className="flex gap-10 md:gap-14 md:pb-1">
          {STATS.map((stat, index) => (
            <RiseIn key={stat.label} shown={inView} delayMs={360 + index * 120}>
              <div className="flex flex-col gap-2">
                <CountUp
                  target={stat.value}
                  shown={inView}
                  delayMs={index * 120}
                  className="metadata text-4xl md:text-6xl text-bone tabular-nums"
                />
                <span className="metadata text-[10px] md:text-xs text-bone-dim uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            </RiseIn>
          ))}
        </div>
      </div>
    </div>
  );
}
