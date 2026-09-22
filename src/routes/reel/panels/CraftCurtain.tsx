import { serviceCategories, editCraft } from '@/content/packages';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { CURTAIN_BAND, PANEL_BODY } from '@/routes/reel/curtain/Act';
import { cn } from '@/lib/cn';
import { Slate } from './Slate';

export function CraftCurtain() {
  const { ref, inView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: CURTAIN_BAND,
  });

  return (
    <div ref={ref} className={cn(PANEL_BODY, 'gap-8 md:gap-12')}>
      <Slate shown={inView}>SEQ 03 — WHAT WE COVER — 24 FPS</Slate>

      <RiseIn shown={inView} delayMs={80} variant="gate">
        <h2 className="font-display text-3xl md:text-5xl text-bone leading-tight tracking-tight">
          Every kind of day
        </h2>
      </RiseIn>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {serviceCategories.map((category, index) => (
          <RiseIn key={category.id} shown={inView} delayMs={140 + index * 40}>
            <span className="metadata text-xs md:text-sm text-bone border border-ink-line rounded-sm px-3 py-2 md:px-4">
              {category.name}
            </span>
          </RiseIn>
        ))}
      </div>

      <div className="border-t border-ink-line pt-8 md:pt-10">
        <RiseIn shown={inView} delayMs={200}>
          <span className="metadata text-xs md:text-sm text-bone-dim uppercase tracking-widest block mb-5">
            The craft
          </span>
        </RiseIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 metadata text-sm">
          {editCraft.map((craft, index) => (
            <RiseIn key={craft.id} shown={inView} delayMs={260 + index * 60}>
              <div className="flex items-center gap-3 border-b border-ink-raise pb-3">
                <span className="text-safelight">▸</span>
                <span className="text-bone">{craft.name}</span>
              </div>
            </RiseIn>
          ))}
        </div>
      </div>
    </div>
  );
}
