import { Link } from 'react-router';
import { site } from '@/content/site';

export function CtaBand() {
  return (
    <section className="bg-ink-raise border-t border-ink-line px-6 py-24">
      <div className="max-w-[1920px] mx-auto flex flex-col items-start gap-8">
        <Link
          to="/contact"
          className="font-display text-4xl md:text-6xl text-bone hover:text-safelight transition-colors tracking-tight"
        >
          Book the slot ▸
        </Link>
        <span className="metadata text-safelight">{site.availability}</span>
      </div>
    </section>
  );
}
