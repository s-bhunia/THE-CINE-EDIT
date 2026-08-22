import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type RiseVariant = 'rise' | 'gate';

export interface RiseInProps {
  /** Driven by the parent section's single observer. */
  shown: boolean;
  delayMs?: number;
  /** `rise` lifts and fades; `gate` wipes open like a film gate. */
  variant?: RiseVariant;
  className?: string;
  children: ReactNode;
}

export function RiseIn({
  shown,
  delayMs = 0,
  variant = 'rise',
  className,
  children,
}: RiseInProps) {
  return (
    <div
      data-in={shown ? 'true' : 'false'}
      className={cn(variant, className)}
      style={{ '--rise-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
