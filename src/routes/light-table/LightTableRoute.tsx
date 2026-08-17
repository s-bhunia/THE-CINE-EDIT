import { useState } from 'react';
import { LoupeImage } from './LoupeImage';
import { Lightbox } from './Lightbox';
import { stills } from '@/content';
import { Meta } from '@/components/seo/Meta';

export function LightTableRoute() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="pt-32 px-6 pb-24 max-w-[1920px] mx-auto min-h-screen">
      <Meta
        title="Light Table"
        description="Photography and frame grabs from the archive, presented as a contact sheet."
        breadcrumbs={[
          { name: 'Reel', path: '/' },
          { name: 'Light Table', path: '/stills' },
        ]}
      />
      <div className="mb-12 border-b border-ink-line pb-4">
        <span className="metadata text-bone-dim block mb-2">
          SEQ 06 — LIGHT TABLE — 35MM
        </span>
        <h1 className="font-display text-4xl text-bone">Light Table</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-ink-raise p-8 border-x-[16px] border-black border-dashed">
        {stills.map((still, idx) => (
          <div key={still.id} className="flex flex-col gap-1">
            <LoupeImage
              src={still.src}
              alt={`Frame ${still.frame}`}
              onClick={() => setActiveIndex(idx)}
            />
            <span className="metadata text-xs text-bone-dim px-1">{still.frame}</span>
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          items={stills.map((s) => ({ src: s.src, alt: `Frame ${s.frame}` }))}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}
