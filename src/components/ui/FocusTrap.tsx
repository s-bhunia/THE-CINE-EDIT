import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export type FocusTrapProps = ComponentPropsWithRef<'div'> & {
  active?: boolean;
  onEscape?: () => void;
};

const isVisible = (element: HTMLElement) =>
  element.offsetWidth > 0 ||
  element.offsetHeight > 0 ||
  element.getClientRects().length > 0;

const focusableWithin = (container: HTMLElement | null) => {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex !== -1 && isVisible(element),
  );
};

export function FocusTrap({
  active = true,
  onEscape,
  className,
  children,
  ...rest
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const restoreTo = document.activeElement;
    const container = containerRef.current;
    const initial = focusableWithin(container)[0];
    if (initial) {
      initial.focus();
    } else {
      container?.focus();
    }
    return () => {
      if (restoreTo instanceof HTMLElement) restoreTo.focus();
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = focusableWithin(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const activeElement = document.activeElement;

      if (!container.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn('outline-none', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
