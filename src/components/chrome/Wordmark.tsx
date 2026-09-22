import { useMemo } from 'react';
import { site } from '@/content/site';
import { useIntroDone } from '@/hooks/useIntroDone';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const LETTER_STAGGER_MS = 90;

interface WordmarkProps {
  /** True only over the hero plate, where the lockup is the page's title. */
  expanded: boolean;
}

/**
 * The single instance of the name on the site. Over the hero it is the title,
 * set large beside the mark; past the plate it settles into the nav bar at the
 * size the header has always used. One element rather than two copies, so the
 * two can never drift apart or be read twice.
 */
export function Wordmark({ expanded }: WordmarkProps) {
  const introDone = useIntroDone();
  const reducedMotion = usePrefersReducedMotion();

  // Split per word first so a line break can only ever land between words —
  // per-letter spans in a flex row would happily break "CINE" in half.
  const words = useMemo(() => {
    let letter = 0;
    return site.name.split(' ').map((word) => ({
      word,
      chars: [...word].map((char) => ({ char, index: letter++ })),
    }));
  }, []);

  // The letters are written once the splash lifts, not underneath it.
  const writing = introDone && !reducedMotion;

  return (
    <span
      className="wordmark relative inline-flex items-center"
      data-expanded={expanded ? 'true' : 'false'}
    >
      {/* The halation puff the hero title used to carry. Mounted on the same
          signal as the letters so it drifts behind them exactly once. */}
      {writing && <span aria-hidden="true" className="hero-title-haze" />}

      <img
        src="/assets/brand/mark-64.png"
        alt=""
        width={64}
        height={67}
        className="wordmark-mark w-auto flex-none"
      />

      {writing ? (
        <>
          <span className="sr-only">{site.name}</span>
          <span aria-hidden="true">
            {words.map(({ word, chars }, wordIndex) => (
              <span key={`${word}-${wordIndex}`}>
                {wordIndex > 0 ? ' ' : null}
                <span className="inline-block whitespace-nowrap">
                  {chars.map(({ char, index }) => (
                    <span
                      key={index}
                      className="hero-letter inline-block"
                      style={{ animationDelay: `${index * LETTER_STAGGER_MS}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        </>
      ) : (
        site.name
      )}
    </span>
  );
}
