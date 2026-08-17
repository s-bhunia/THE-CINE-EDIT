import { process } from '@/content/process';

export function ProcessBeats() {
  return (
    <section className="py-24 border-t border-ink-line">
      <div className="px-6 max-w-[1920px] mx-auto mb-12">
        <span className="metadata text-bone-dim">SEQ 02 — PROCESS — 24 FPS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-line">
        {process.map((beat) => (
          <div key={beat.id} className="px-6 py-8 md:py-0 flex flex-col gap-6">
            <div className="aspect-video bg-ink-raise overflow-hidden">
              <img
                src={beat.image}
                alt={beat.label}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display text-2xl text-bone mb-2">{beat.label}</h3>
              <p className="text-bone-dim max-w-[40ch]">{beat.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
