import { useEffect, useRef, useState } from 'react';
import { audioEngine } from '@/lib/audio/engine';
import { useMediaCapability } from '@/hooks/useMediaCapability';

const BAR_WEIGHTS = [0.62, 1, 0.78];
const IDLE_LEVEL = 0.16;
const FLOOR_HEIGHT = 2;
const CEILING_HEIGHT = 16;

export function AudioToggle() {
  const [isMuted, setIsMuted] = useState(() => audioEngine.isMuted());
  const { allowMotion } = useMediaCapability();
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => audioEngine.subscribe(setIsMuted), []);

  useEffect(() => {
    const arm = () => {
      void audioEngine.init();
    };
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, []);

  useEffect(() => {
    const paint = (level: number) => {
      bars.current.forEach((bar, index) => {
        if (!bar) return;
        const weighted = Math.min(1, level * (BAR_WEIGHTS[index] ?? 1));
        bar.style.height = `${FLOOR_HEIGHT + weighted * (CEILING_HEIGHT - FLOOR_HEIGHT)}px`;
      });
    };

    if (isMuted) {
      paint(0);
      return;
    }

    if (!allowMotion) {
      paint(IDLE_LEVEL * 2);
      return;
    }

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const measured = audioEngine.getLevel();
      const elapsed = (now - started) / 1000;
      const idle = IDLE_LEVEL * (0.5 + 0.5 * Math.sin(elapsed * 2.1));
      paint(measured > 0 ? measured : idle);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [allowMotion, isMuted]);

  return (
    <button
      onClick={() => {
        const muted = audioEngine.toggleMute();
        if (!muted) audioEngine.play('tape-click');
      }}
      className="fixed bottom-6 right-6 z-50 flex items-end gap-[2px] h-5 cursor-pointer mix-blend-difference group px-2 py-1"
      aria-pressed={!isMuted}
      aria-label={isMuted ? 'Turn interface sound on' : 'Turn interface sound off'}
    >
      {BAR_WEIGHTS.map((weight, index) => (
        <span
          key={weight}
          ref={(node) => {
            bars.current[index] = node;
          }}
          aria-hidden="true"
          className="w-[3px] bg-bone"
          style={{ height: `${FLOOR_HEIGHT}px` }}
        />
      ))}
      <span className="metadata text-[10px] text-bone ml-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        {isMuted ? 'MUTED' : 'AUDIO ON'}
      </span>
    </button>
  );
}
