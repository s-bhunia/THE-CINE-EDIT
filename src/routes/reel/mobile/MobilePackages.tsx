import { serviceCategories, editCraft } from '@/content/packages';
import { useInView } from '@/hooks/useInView';
import { RiseIn } from '@/components/ui/RiseIn';
import { MobileSectionHead } from './MobileSectionHead';

const CHIP_STAGGER_MS = 70;
const CRAFT_STAGGER_MS = 80;

export function MobilePackages() {
  const { ref, inView } = useInView<HTMLElement>();

  // The craft list keeps counting on from where the chips finished, so the whole
  // section reads as one continuous run rather than two separate bursts.
  const craftStart = 220 + serviceCategories.length * CHIP_STAGGER_MS;

  return (
    <section
      ref={ref}
      id="packages"
      className="scroll-mt-20 py-16 border-t border-ink-line"
    >
      <MobileSectionHead
        slate="SEQ 04 — WHAT WE COVER"
        title="Every kind of day"
        shown={inView}
      />

      <div className="mt-8 px-6">
        <div className="flex flex-wrap gap-2">
          {serviceCategories.map((category, index) => (
            <RiseIn
              key={category.id}
              shown={inView}
              delayMs={220 + index * CHIP_STAGGER_MS}
            >
              <span className="metadata text-xs text-bone border border-ink-line rounded-full px-3 py-1.5 inline-block">
                {category.name}
              </span>
            </RiseIn>
          ))}
        </div>

        <div className="border-t border-ink-line mt-10 pt-6">
          <RiseIn shown={inView} delayMs={craftStart}>
            <span
              className="metadata uppercase tracking-widest text-bone-dim block mb-4"
              style={{ fontSize: '10px' }}
            >
              The craft
            </span>
          </RiseIn>

          <div className="grid grid-cols-1 gap-y-2 metadata text-sm">
            {editCraft.map((craft, index) => (
              <RiseIn
                key={craft.id}
                shown={inView}
                delayMs={craftStart + 120 + index * CRAFT_STAGGER_MS}
              >
                <div className="flex items-center gap-3 border-b border-ink-raise pb-2">
                  <span className="text-safelight">▸</span>
                  <span className="text-bone">{craft.name}</span>
                </div>
              </RiseIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
