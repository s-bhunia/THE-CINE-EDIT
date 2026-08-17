import { serviceCategories, editCraft } from '@/content/packages';

export function Packages() {
  return (
    <section className="py-24 border-t border-ink-line px-6 max-w-[1920px] mx-auto">
      <div className="mb-12">
        <span className="metadata text-bone-dim">SEQ 03 — WHAT WE COVER</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-16">
        {serviceCategories.map((category) => (
          <span
            key={category.id}
            className="metadata text-sm text-bone border border-ink-line rounded-sm px-4 py-2"
          >
            {category.name}
          </span>
        ))}
      </div>

      <div className="border-t border-ink-line pt-12">
        <span className="metadata text-bone-dim block mb-6">THE CRAFT</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 metadata text-sm">
          {editCraft.map((craft) => (
            <div
              key={craft.id}
              className="flex items-center gap-3 border-b border-ink-raise pb-3"
            >
              <span className="text-safelight">▸</span>
              <span className="text-bone">{craft.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
