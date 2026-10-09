import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const NEW_SRC = '/assets/about/portrait-field-1080.avif';
const NEW_SRCSET = '/assets/about/portrait-field.avif 640w, /assets/about/portrait-field-1080.avif 1080w';
const OLD_SRC_SMALL = '/assets/about/portrait.avif';
const OLD_SRC = '/assets/about/portrait-1080.avif';
const OLD_SRCSET = `${OLD_SRC_SMALL} 640w, ${OLD_SRC} 1080w`;
const SIZES = '(min-width: 1024px) 40vw, 100vw';

/** Measured from the moment the tab opened, not from arriving on this page. */
const SWAP_AT_MS = 60_000;
/** Whoever arrives after the minute still sees the first portrait for a beat. */
const MIN_SEEN_MS = 2500;
const DISSOLVE_MS = 2600;
const GRAIN_PX = 3;
/** Width of the soft band each grain fades across, in threshold units. */
const SOFT = 0.12;
const EMBER: [number, number, number] = [212, 112, 58];

type Stage = 'first' | 'dissolving' | 'second';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The editor's portrait, which after the tab has been open a minute develops
 * grain by grain into a second one. The grains resolve from the subject
 * outwards with noise mixed in, and a safelight ember rides the front.
 *
 * All of it is one short-lived canvas: a grain-resolution mask is written per
 * frame, scaled up unsmoothed so each grain stays a crisp square, and the
 * second portrait is composited through it. Once it is fully drawn the canvas
 * is swapped for a plain <img> of the same pixels.
 */
export function PortraitDissolve({ alt }: { alt: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '0px' });
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const secondRef = useRef<HTMLImageElement | null>(null);
  const [stage, setStage] = useState<Stage>('first');

  useEffect(() => {
    if (!inView || stage !== 'first') return;
    let cancelled = false;
    const wait = Math.max(SWAP_AT_MS - performance.now(), MIN_SEEN_MS);
    const timer = setTimeout(() => {
      const wide = (ref.current?.clientWidth ?? 0) * (window.devicePixelRatio || 1) > 640;
      const image = new Image();
      image.src = wide ? OLD_SRC : OLD_SRC_SMALL;
      image
        .decode()
        .then(() => {
          if (cancelled) return;
          secondRef.current = image;
          setStage(reducedMotion ? 'second' : 'dissolving');
        })
        .catch(() => {});
    }, wait);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView, stage, reducedMotion, ref]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = secondRef.current;
    const frame = ref.current;
    if (stage !== 'dissolving' || !canvas || !image || !frame) return;

    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const maskCtx = mask.getContext('2d');
    if (!ctx || !maskCtx) {
      setStage('second');
      return;
    }

    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const cols = Math.ceil(width / GRAIN_PX);
    const rows = Math.ceil(height / GRAIN_PX);
    mask.width = cols;
    mask.height = rows;
    const maskData = maskCtx.createImageData(cols, rows);
    const ember = document.createElement('canvas');
    ember.width = cols;
    ember.height = rows;
    const emberCtx = ember.getContext('2d')!;
    const emberData = emberCtx.createImageData(cols, rows);

    // Each grain's moment to resolve: distance from the subject plus noise.
    const thresholds = new Float32Array(cols * rows);
    const maxReach = Math.hypot(0.5, 0.6);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const reach = Math.hypot(x / cols - 0.5, y / rows - 0.4) / maxReach;
        thresholds[y * cols + x] = reach * 0.5 + Math.random() * 0.5;
      }
    }

    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawW = image.naturalWidth * scale;
    const drawH = image.naturalHeight * scale;
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;

    let raf = 0;
    let start: number | null = null;

    const paint = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / DISSOLVE_MS);
      const front = easeInOut(t) * (1 + SOFT);

      const m = maskData.data;
      const e = emberData.data;
      for (let i = 0; i < thresholds.length; i += 1) {
        const a = Math.min(1, Math.max(0, (front - thresholds[i]!) / SOFT));
        const o = i * 4;
        m[o + 3] = a * 255;
        e[o] = EMBER[0];
        e[o + 1] = EMBER[1];
        e[o + 2] = EMBER[2];
        e[o + 3] = a > 0 && a < 1 ? Math.sin(a * Math.PI) * 230 : 0;
      }
      maskCtx.putImageData(maskData, 0, 0);
      emberCtx.putImageData(emberData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(image, drawX, drawY, drawW, drawH);
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(ember, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      if (t < 1) raf = requestAnimationFrame(paint);
      else setStage('second');
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [stage, ref]);

  return (
    <div ref={ref} className="absolute inset-0">
      <img
        src={NEW_SRC}
        srcSet={NEW_SRCSET}
        sizes={SIZES}
        alt={stage === 'second' ? '' : alt}
        width={1080}
        height={1526}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {stage === 'dissolving' && (
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      )}
      {stage === 'second' && (
        <img
          src={secondRef.current?.currentSrc || OLD_SRC}
          srcSet={OLD_SRCSET}
          sizes={SIZES}
          alt={alt}
          width={1024}
          height={1536}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${reducedMotion ? 'portrait-fade-in' : ''}`}
        />
      )}
    </div>
  );
}
