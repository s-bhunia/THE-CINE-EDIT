import { Link } from 'react-router';
import type { Work } from '@/types/content';

interface AdjacentClipsProps {
  prev: Work | undefined;
  next: Work | undefined;
}

export function AdjacentClips({ prev, next }: AdjacentClipsProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Adjacent case studies"
      className="border-t border-ink-line grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-line"
    >
      {prev ? (
        <Link
          to={`/work/${prev.slug}`}
          className="group px-6 py-12 flex flex-col gap-2 hover:bg-ink-raise transition-colors"
        >
          <span className="metadata text-bone-dim">◂ PREV</span>
          <span className="font-display text-2xl text-bone group-hover:text-safelight transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={`/work/${next.slug}`}
          className="group px-6 py-12 flex flex-col gap-2 items-end text-right hover:bg-ink-raise transition-colors"
        >
          <span className="metadata text-bone-dim">NEXT ▸</span>
          <span className="font-display text-2xl text-bone group-hover:text-safelight transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
