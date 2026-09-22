import { RiseIn } from '@/components/ui/RiseIn';

/**
 * The strip of camera-report metadata each panel opens on. Kept in one place so
 * the sequence numbers stay in page order rather than drifting per component.
 */
export function Slate({ children, shown }: { children: string; shown: boolean }) {
  return (
    <RiseIn shown={shown}>
      <span className="metadata text-xs md:text-sm text-bone-dim uppercase tracking-widest">
        {children}
      </span>
    </RiseIn>
  );
}
