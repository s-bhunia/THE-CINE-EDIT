import { useEffect, useState } from 'react';
import { useMediaCapability } from '@/hooks/useMediaCapability';

interface Snapshot {
  reducedMotion: boolean;
  saveData: string;
  effectiveType: string;
  cores: number;
  coarsePointer: boolean;
  visibility: string;
  videoExists: boolean;
  videoReadyState: number | null;
  videoPaused: boolean | null;
  videoSrc: string;
  videoError: number | null;
  videoOpacity: string;
  canvasExists: boolean;
  glOk: boolean | null;
}

function readSnapshot(): Snapshot {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const video = document.querySelector('main video');
  const canvas = document.querySelector('main canvas');
  const media = video instanceof HTMLVideoElement ? video : null;

  let glOk: boolean | null = null;
  if (canvas instanceof HTMLCanvasElement) {
    glOk = canvas.getContext('webgl2') !== null;
  }

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: String(connection?.saveData ?? 'unknown'),
    effectiveType: connection?.effectiveType ?? 'unknown',
    cores: navigator.hardwareConcurrency ?? 0,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    visibility: document.visibilityState,
    videoExists: Boolean(media),
    videoReadyState: media?.readyState ?? null,
    videoPaused: media?.paused ?? null,
    videoSrc: media?.currentSrc?.split('/').pop() ?? 'none',
    videoError: media?.error?.code ?? null,
    videoOpacity: media ? getComputedStyle(media).opacity : 'n/a',
    canvasExists: Boolean(canvas),
    glOk,
  };
}

export function MediaDiagnostics() {
  const capability = useMediaCapability();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const update = () => setSnapshot(readSnapshot());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!snapshot) return null;

  const rows: Array<[string, string]> = [
    ['allowMotion', String(capability.allowMotion)],
    ['allowHeroVideo', String(capability.allowHeroVideo)],
    ['allowVideoPreview', String(capability.allowVideoPreview)],
    ['allowWebgl', String(capability.allowWebgl)],
    ['reducedMotion', String(snapshot.reducedMotion)],
    ['saveData', snapshot.saveData],
    ['effectiveType', snapshot.effectiveType],
    ['cores', String(snapshot.cores)],
    ['coarsePointer', String(snapshot.coarsePointer)],
    ['visibility', snapshot.visibility],
    ['video element', String(snapshot.videoExists)],
    ['video src', snapshot.videoSrc],
    ['video readyState', String(snapshot.videoReadyState)],
    ['video paused', String(snapshot.videoPaused)],
    ['video opacity', snapshot.videoOpacity],
    ['video error', String(snapshot.videoError)],
    ['canvas', String(snapshot.canvasExists)],
    ['webgl2', String(snapshot.glOk)],
  ];

  return (
    <div className="fixed inset-x-2 top-24 z-[100] bg-ink border border-safelight p-3 metadata text-bone">
      <div className="text-safelight uppercase mb-2" style={{ fontSize: '10px' }}>
        Media diagnostics
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1" style={{ fontSize: '10px' }}>
        {rows.map(([key, value]) => (
          <div key={key} className="contents">
            <span className="text-bone-dim">{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
