import { site } from '@/content/site';
import { SlateForm } from './SlateForm';
import { Meta } from '@/components/seo/Meta';

export function ContactRoute() {
  return (
    <div className="pt-32 px-6 pb-24 max-w-[1920px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6">
      <Meta
        title="The Slate"
        description="Book Manas Bera for wedding films, cinematic narrative, and commercial edits."
        breadcrumbs={[
          { name: 'Reel', path: '/' },
          { name: 'The Slate', path: '/contact' },
        ]}
      />
      <div className="lg:col-span-4 lg:col-start-2 flex flex-col gap-8">
        <div className="border-b border-ink-line pb-4">
          <span className="metadata text-bone-dim">SEQ 09 — THE SLATE — ENQUIRY</span>
        </div>

        <h1 className="font-display text-5xl lg:text-6xl text-bone leading-none">
          Ready to cut.
        </h1>

        <p className="text-lg text-bone/80 max-w-[40ch]">
          For bookings, rate cards, or technical inquiries regarding remote proxy
          workflows, submit the slate.
        </p>

        <div className="metadata text-safelight border border-safelight px-4 py-2 self-start rounded-sm mt-4">
          {site.availability}
        </div>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <SlateForm />
      </div>
    </div>
  );
}
