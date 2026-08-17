import { useEffect, useRef } from 'react';
import { audioEngine } from '@/lib/audio/engine';

interface LightboxItem {
  src: string;
  alt: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeRef.current?.focus();
    audioEngine.play('shutter');
    return () => {
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, []);

  useEffect(() => {
    const goPrev = () => onNavigate((index - 1 + items.length) % items.length);
    const goNext = () => onNavigate((index + 1) % items.length);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();

      if (e.key === 'Tab') {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index, items.length, onClose, onNavigate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      onNavigate((index + (delta < 0 ? 1 : -1) + items.length) % items.length);
    }
    touchStartX.current = null;
  };

  const current = items[index];
  if (!current) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClose}
    >
      <img
        src={current.src}
        alt={current.alt}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-6 right-6 metadata text-bone hover:text-safelight"
      >
        ESC
      </button>
    </div>
  );
}
