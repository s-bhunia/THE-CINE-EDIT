import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { CSSProperties } from 'react';
import { site } from '@/content/site';
import { bootStore } from '@/store/boot';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const LETTER_STAGGER_MS = 48;

// Long enough for the gate wipe (640ms) and the full letter cascade
// (11 letters × 48ms + the 940ms hero-letter animation) to land before the
// exit can start — cutting either off mid-flight reads as a stutter, not a cut.
const MIN_SHOW_MS = 1550;
// A dead connection must not trap the visitor behind the splash. Past this the
// site is shown anyway; the hero poster stays up until the clip can play.
const MAX_WAIT_MS = 15000;
// Lets the progress rule visibly reach the end before the cut starts.
const FILLED_HOLD_MS = 380;
const GROW_MS = 240;
const SPREAD_MS = 200;
const FADE_MS = 340;
const REDUCED_MIN_MS = 280;
const REDUCED_FADE_MS = 220;

// Where the mark's own red bar sits inside /assets/brand/mark.png (a 489×514
// asset), as a fraction of the rendered image — measured off the source pixels
// (red spans x 149–194, y 46–468) so the cut can grow out of that exact spot
// instead of a second red line appearing from nowhere.
const RED_BAR = { left: 149 / 489, top: 46 / 514, width: 45 / 489, height: 422 / 514 };
const OVERSCAN = 1.15;

type CutStage = 'idle' | 'grow' | 'spread';

interface SeedRect {
  left: number;
  top: number;
  width: number;
  height: number;
  growScale: number;
  spreadScale: number;
}

interface AppLoaderProps {
  onDone: () => void;
}

/**
 * One-shot boot splash. Lives above everything (z-[300]) while the rest of
 * the tree mounts underneath it, then plays a "cut" — the same visual verb
 * CutTransition uses on every later route change — to reveal the site.
 *
 * The cut is seeded from the mark's own red bar rather than a new line: a
 * transparent overlay sits exactly over those pixels, then grows tall and
 * spreads wide once the wordmark has finished writing.
 *
 * Mounted once from App's initial state, which only exists for the life of
 * a hard page load: client-side navigation keeps App mounted and swaps only
 * the routed <Outlet>, so this never replays between pages.
 */
export function AppLoader({ onDone }: AppLoaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [cutStage, setCutStage] = useState<CutStage>('idle');
  const [exiting, setExiting] = useState(false);
  const markRef = useRef<HTMLImageElement>(null);
  const [seed, setSeed] = useState<SeedRect | null>(null);

  // Measures the mark's rendered red bar so the cut overlay can sit exactly
  // on top of it. getBoundingClientRect is viewport-relative, which is what a
  // fixed-position overlay needs, and clip-path on an ancestor (the gate wipe)
  // never affects this layout box.
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const measure = () => {
      const img = markRef.current;
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const width = rect.width * RED_BAR.width;
      const height = rect.height * RED_BAR.height;
      if (width <= 0 || height <= 0) return;
      setSeed({
        left: rect.left + rect.width * RED_BAR.left,
        top: rect.top + rect.height * RED_BAR.top,
        width,
        height,
        growScale: (window.innerHeight * OVERSCAN) / height,
        spreadScale: (window.innerWidth * OVERSCAN) / width,
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reducedMotion]);

  const assetsReady = useSyncExternalStore(bootStore.subscribe, bootStore.getAssetsReady);
  const progress = useSyncExternalStore(bootStore.subscribe, bootStore.getAssetProgress);
  const [minShown, setMinShown] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();
    const minDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, reducedMotion ? REDUCED_MIN_MS : MIN_SHOW_MS),
    );
    void Promise.all([minDelay, fontsReady]).then(() => !cancelled && setMinShown(true));
    const cap = setTimeout(() => setGaveUp(true), MAX_WAIT_MS);
    return () => {
      cancelled = true;
      clearTimeout(cap);
    };
  }, [reducedMotion]);

  const canExit = minShown && (assetsReady || gaveUp);

  useEffect(() => {
    if (!canExit) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

    if (reducedMotion) {
      setExiting(true);
      after(REDUCED_FADE_MS, onDone);
    } else {
      after(FILLED_HOLD_MS, () => {
        setCutStage('grow');
        after(GROW_MS, () => {
          setCutStage('spread');
          after(SPREAD_MS, () => {
            setExiting(true);
            after(FADE_MS, onDone);
          });
        });
      });
    }
    return () => timers.forEach(clearTimeout);
  }, [canExit, reducedMotion, onDone]);

  const shownProgress = canExit ? 1 : progress;

  // Split per word, same convention as HeroPlate's title, so the join stays
  // an explicit JSX space rather than a single-space text node that a
  // per-letter span could collapse.
  const words = useMemo(() => {
    let letter = 0;
    return site.name.split(' ').map((word) => ({
      word,
      chars: [...word].map((char) => ({ char, index: letter++ })),
    }));
  }, []);

  return (
    <div
      data-app-loader
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-6 bg-ink"
      style={{
        opacity: exiting ? 0 : 1,
        transitionProperty: 'opacity',
        transitionDuration: `${reducedMotion ? REDUCED_FADE_MS : FADE_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.84, 0)',
      }}
    >
      <span className="sr-only">{`Loading ${site.name}`}</span>

      <div aria-hidden="true" className="relative flex flex-col items-center gap-5">
        {!reducedMotion && (
          <span
            className="app-loader-glow pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--color-cine-red), transparent 70%)',
            }}
          />
        )}

        <span className={reducedMotion ? 'inline-flex' : 'app-loader-mark inline-flex'}>
          <img
            ref={markRef}
            src="/assets/brand/mark.png"
            alt=""
            width={489}
            height={514}
            className="h-16 md:h-20 w-auto"
          />
        </span>

        <p className="metadata text-sm md:text-base tracking-[0.4em] text-bone">
          {reducedMotion ? (
            site.name
          ) : (
            <>
              {words.map(({ word, chars }, wordIndex) => (
                <span key={`${word}-${wordIndex}`}>
                  {wordIndex > 0 ? ' ' : null}
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
              ))}
            </>
          )}
        </p>

        <span className="flex items-center gap-3">
          <span className="block h-px w-40 overflow-hidden bg-ink-line">
            <span
              className="app-loader-rule-fill block h-full w-full bg-safelight"
              style={{ transform: `scaleX(${shownProgress})` }}
            />
          </span>
          <span className="metadata w-[4ch] text-right text-[10px] tabular-nums text-bone-dim">
            {String(Math.round(shownProgress * 100)).padStart(3, '0')}
          </span>
        </span>
      </div>

      {!reducedMotion && seed && (
        <span
          aria-hidden="true"
          data-stage={cutStage}
          className="app-loader-seed fixed bg-cine-red"
          style={
            {
              left: seed.left,
              top: seed.top,
              width: seed.width,
              height: seed.height,
              '--grow-scale': seed.growScale,
              '--spread-scale': seed.spreadScale,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
