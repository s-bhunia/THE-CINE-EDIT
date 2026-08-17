import { site } from '@/content/site';
import { about } from '@/content/about';
import { Meta } from '@/components/seo/Meta';
import { ReelStage } from '@/components/gl/ReelStage';

export function AboutRoute() {
  return (
    <article className="pt-32 px-6 pb-24 max-w-[1920px] mx-auto min-h-screen">
      <Meta
        title="The Editor"
        description={`${site.editor} — wedding and cinematic film editor profile, philosophy, and technical workflow.`}
      />

      <div className="mb-12 border-b border-ink-line pb-4">
        <span className="metadata text-bone-dim">SEQ 08 — THE EDITOR — PROFILE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 relative">
        <div className="lg:col-span-5 lg:col-start-2">
          <div className="aspect-[4/5] bg-ink-raise overflow-hidden relative">
            <picture>
              <source
                type="image/avif"
                srcSet="/assets/about/portrait.avif 640w, /assets/about/portrait-1080.avif 1080w"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet="/assets/about/portrait.webp 640w, /assets/about/portrait-1080.webp 1080w"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <img
                src="/assets/about/portrait-1080.webp"
                alt={site.editor}
                width={1080}
                height={1350}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>

            <div className="absolute -bottom-12 -right-12 w-64 h-64 z-20 hidden lg:block pointer-events-none">
              <ReelStage />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 flex flex-col gap-12 pt-8">
          <h1 className="text-4xl text-bone tracking-tight uppercase metadata">
            {site.editor}
          </h1>

          <div className="flex flex-col gap-6 text-lg text-bone/90 max-w-[60ch]">
            {about.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <blockquote className="my-12">
            <p className="font-display text-4xl lg:text-5xl text-bone leading-tight tracking-tight">
              &ldquo;{about.philosophy}&rdquo;
            </p>
          </blockquote>

          <div className="mt-12 border-t border-ink-line pt-8">
            <span className="metadata text-bone-dim mb-6 block">
              STUDIO SPECIFICATIONS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 metadata text-sm">
              {Object.entries(about.gear).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-ink-raise pb-2"
                >
                  <span className="text-bone-dim">{key}</span>
                  <span className="text-bone">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-ink-line pt-8">
            <span className="metadata text-bone-dim mb-6 block">FOR PRODUCERS</span>
            <div className="grid grid-cols-1 gap-y-4 metadata text-sm">
              {Object.entries(about.producerNotes).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-3 border-b border-ink-raise pb-2"
                >
                  <span className="text-bone-dim">{key}</span>
                  <span className="col-span-2 text-bone">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
