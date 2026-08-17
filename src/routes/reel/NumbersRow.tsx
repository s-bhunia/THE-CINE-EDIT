import { site } from '@/content/site';

const STATS = [
  { label: 'Projects Delivered', value: `${site.stats.projectsDelivered}+` },
  { label: 'Happy Clients', value: `${site.stats.clients}+` },
];

export function NumbersRow() {
  return (
    <section className="px-6 py-16 max-w-[1920px] mx-auto border-t border-ink-line">
      <div className="grid grid-cols-2 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <span className="metadata text-4xl md:text-5xl text-bone tabular-nums">
              {stat.value}
            </span>
            <span className="metadata text-xs text-bone-dim uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
