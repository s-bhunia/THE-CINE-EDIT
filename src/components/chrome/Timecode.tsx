import { useScrollTimecode } from '@/hooks/useScrollTimecode';

export function Timecode() {
  const timecode = useScrollTimecode(120, 24);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none mix-blend-difference text-bone">
      <span className="metadata text-sm tracking-widest">{timecode}</span>
    </div>
  );
}
