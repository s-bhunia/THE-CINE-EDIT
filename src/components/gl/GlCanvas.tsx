import { useCallback, useState } from 'react';
import { FilmPlate } from './FilmPlate';
import { CssFallbackGrain } from './CssFallbackGrain';
import { useMediaCapability } from '@/hooks/useMediaCapability';

interface GlCanvasProps {
  video: HTMLVideoElement | null;
  onContextChange?: (live: boolean) => void;
}

export function GlCanvas({ video, onContextChange }: GlCanvasProps) {
  const { allowWebgl, allowMotion } = useMediaCapability();
  const [plateUnavailable, setPlateUnavailable] = useState(false);

  const handleContextChange = useCallback(
    (live: boolean) => {
      setPlateUnavailable(!live);
      onContextChange?.(live);
    },
    [onContextChange],
  );

  if (!allowWebgl || !video) {
    return <CssFallbackGrain />;
  }

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none" aria-hidden="true">
      <FilmPlate
        video={video}
        animated={allowMotion}
        onContextChange={handleContextChange}
      />
      {plateUnavailable && <CssFallbackGrain />}
    </div>
  );
}
