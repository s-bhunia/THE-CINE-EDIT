import { useState, useEffect } from 'react';
import type { MediaCapability } from '@/types/media';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

const PROBE_FRAMES = 30;
const MIN_ACCEPTABLE_FPS = 45;

let webglSupport: boolean | null = null;
let probeVerdict: boolean | null = null;
let probeRunning = false;

function supportsWebgl2(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = canvas.getContext('webgl2') !== null;
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function readConnection(): NetworkInformation {
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  return nav.connection ?? {};
}

function detect(): MediaCapability {
  if (typeof window === 'undefined') {
    return {
      allowMotion: false,
      allowVideoPreview: false,
      allowHeroVideo: false,
      allowWebgl: false,
      tier: 'base',
    };
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const connection = readConnection();
  const isDataSaver = connection.saveData === true;
  const isSlowConnection =
    connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
  const isLowHardware = (navigator.hardwareConcurrency ?? 8) <= 4;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  const allowMotion = !prefersReducedMotion;
  const allowHeroVideo =
    allowMotion &&
    !isDataSaver &&
    !isSlowConnection &&
    document.visibilityState === 'visible';
  const allowVideoPreview = allowHeroVideo && !(isLowHardware && isCoarsePointer);
  const allowWebgl =
    allowMotion && !isDataSaver && supportsWebgl2() && probeVerdict !== false;

  return {
    allowMotion,
    allowVideoPreview,
    allowHeroVideo,
    allowWebgl,
    tier: allowWebgl ? 'high' : 'base',
  };
}

function probeFrameRate(onVerdict: (passed: boolean) => void) {
  if (probeVerdict !== null) {
    onVerdict(probeVerdict);
    return;
  }
  if (probeRunning) return;
  probeRunning = true;

  let frames = 0;
  const started = performance.now();

  const step = () => {
    frames += 1;
    if (frames < PROBE_FRAMES) {
      requestAnimationFrame(step);
      return;
    }
    const elapsed = (performance.now() - started) / 1000;
    probeVerdict = frames / elapsed >= MIN_ACCEPTABLE_FPS;
    probeRunning = false;
    onVerdict(probeVerdict);
  };

  requestAnimationFrame(step);
}

export function useMediaCapability(): MediaCapability {
  const [capabilities, setCapabilities] = useState<MediaCapability>(detect);

  useEffect(() => {
    const resync = () => setCapabilities(detect());

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', resync);
    document.addEventListener('visibilitychange', resync);

    probeFrameRate(resync);
    resync();

    return () => {
      motionQuery.removeEventListener('change', resync);
      document.removeEventListener('visibilitychange', resync);
    };
  }, []);

  return capabilities;
}
