import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from '@/lib/audio/engine';
import { useMediaCapability } from '@/hooks/useMediaCapability';
import { toTimecode } from '@/lib/format/timecode';

const TIMECODE_FPS = 24;
const MP4_TYPE = 'video/mp4; codecs=avc1.640028';
const NARROW_VIEWPORT = '(max-width: 768px)';
const SKIP_SECONDS = 5;
const CONTROLS_IDLE_MS = 2500;
const REVEAL_THROTTLE_MS = 200;
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

interface BufferedSpan {
  start: number;
  end: number;
}

export interface OverlayPlayerSources {
  h1080: string;
  h720: string;
}

interface OverlayPlayerProps {
  assetId: string;
  label: string;
  sources: OverlayPlayerSources;
  poster: string;
  durationSeconds: number;
  onClose: () => void;
}

function timecodeOf(seconds: number) {
  return toTimecode(Math.max(0, seconds) * TIMECODE_FPS, TIMECODE_FPS);
}

function fullscreenTarget() {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function OverlayPlayer({
  assetId,
  label,
  sources,
  poster,
  durationSeconds,
  onClose,
}: OverlayPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const lastRevealRef = useRef(0);
  const { allowMotion } = useMediaCapability();

  const [duration, setDuration] = useState(durationSeconds);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [buffered, setBuffered] = useState<BufferedSpan[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [chromeFocused, setChromeFocused] = useState(false);
  const [idleTick, setIdleTick] = useState(0);

  const storageKey = `playback-${assetId}`;

  const revealControls = useCallback(() => {
    const now = performance.now();
    if (now - lastRevealRef.current < REVEAL_THROTTLE_MS) return;
    lastRevealRef.current = now;
    setControlsVisible(true);
    setIdleTick((tick) => tick + 1);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
    audioEngine.play('tape-click');
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const limit = Number.isFinite(video.duration) ? video.duration : video.currentTime;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), limit);
  }, []);

  const applyMuted = useCallback((next: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = next;
    setMuted(next);
    audioEngine.rampMediaGain(next ? 0 : 1);
    audioEngine.play('tape-click');
  }, []);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current as FullscreenElement | null;
    if (!shell) return;
    const doc = document as FullscreenDocument;

    if (fullscreenTarget()) {
      if (typeof doc.exitFullscreen === 'function') {
        void Promise.resolve(doc.exitFullscreen()).catch(() => {});
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        void Promise.resolve(doc.webkitExitFullscreen()).catch(() => {});
      }
      return;
    }

    if (typeof shell.requestFullscreen === 'function') {
      void Promise.resolve(shell.requestFullscreen()).catch(() => {});
    } else if (typeof shell.webkitRequestFullscreen === 'function') {
      void Promise.resolve(shell.webkitRequestFullscreen()).catch(() => {});
    }
  }, []);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeRef.current?.focus();
    audioEngine.play('reel-spool');
    audioEngine.rampMediaGain(0);

    return () => {
      audioEngine.rampMediaGain(1);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, []);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const disposeAudio = audioEngine.registerMedia(video);
    const savedPosition = Number(sessionStorage.getItem(storageKey));

    const readBuffered = () => {
      const ranges: BufferedSpan[] = [];
      for (let index = 0; index < video.buffered.length; index += 1) {
        ranges.push({
          start: video.buffered.start(index),
          end: video.buffered.end(index),
        });
      }
      setBuffered(ranges);
    };

    let resumed = false;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration);
      readBuffered();
    };

    const handleCanPlay = () => {
      if (resumed) return;
      resumed = true;
      if (savedPosition > 0 && savedPosition < video.duration - 1) {
        video.currentTime = savedPosition;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime > 0) {
        sessionStorage.setItem(storageKey, video.currentTime.toString());
      }
      readBuffered();
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleVolumeChange = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', readBuffered);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    video.muted = true;
    video.preload = 'metadata';
    video.load();
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', readBuffered);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      disposeAudio();

      video.pause();
      video.preload = 'none';
      video.removeAttribute('src');
      video.load();
    };
  }, [storageKey]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(fullscreenTarget() !== null);
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const onRange = target instanceof HTMLInputElement && target.type === 'range';
      const onButton = target instanceof HTMLButtonElement;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const shell = shellRef.current;
        if (!shell) return;
        const focusable = Array.from(shell.querySelectorAll<HTMLElement>(FOCUSABLE));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (!shell.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case ' ':
          if (onButton) return;
          event.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (onRange) return;
          event.preventDefault();
          seekBy(SKIP_SECONDS);
          break;
        case 'ArrowLeft':
          if (onRange) return;
          event.preventDefault();
          seekBy(-SKIP_SECONDS);
          break;
        case 'm':
        case 'M':
          applyMuted(!muted);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        default:
          return;
      }

      setControlsVisible(true);
      setIdleTick((tick) => tick + 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [applyMuted, muted, onClose, seekBy, toggleFullscreen, togglePlay]);

  useEffect(() => {
    if (!playing || chromeFocused) {
      setControlsVisible(true);
      return;
    }
    const timer = window.setTimeout(() => {
      if (shellRef.current?.contains(document.activeElement)) return;
      setControlsVisible(false);
    }, CONTROLS_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, chromeFocused, idleTick]);

  const safeDuration = duration > 0 ? duration : 1;
  const playedFraction = Math.min(1, currentTime / safeDuration);
  const chromeTransition = allowMotion ? 'transition-opacity duration-300 ease-out' : '';
  const chromeState = controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const buttonClass =
    'metadata text-[11px] uppercase tracking-[0.08em] px-2 py-1 rounded-[2px] border border-ink-line text-bone-dim hover:text-safelight hover:border-safelight focus-visible:outline-1 focus-visible:outline-safelight';
  const rangeClass =
    'relative w-full appearance-none bg-transparent focus:outline-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-[2px] [&::-webkit-slider-thumb]:bg-safelight [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-[2px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-safelight';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} — full screen player`}
      className="fixed inset-0 z-[100] bg-ink flex items-center justify-center p-4 lg:p-16"
      onPointerMove={revealControls}
      onPointerDown={revealControls}
      onClick={onClose}
      onFocus={() => {
        setChromeFocused(true);
        setControlsVisible(true);
      }}
      onBlur={(event) => {
        setChromeFocused(shellRef.current?.contains(event.relatedTarget) ?? false);
      }}
    >
      <div
        ref={shellRef}
        className="relative z-10 w-full max-w-7xl aspect-video bg-ink border border-ink-line"
        onClick={(event) => event.stopPropagation()}
      >
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          preload="metadata"
          controls={false}
          className="absolute inset-0 w-full h-full object-contain"
        >
          <source src={sources.h720} type={MP4_TYPE} media={NARROW_VIEWPORT} />
          <source src={sources.h1080} type={MP4_TYPE} />
        </video>

        <div
          className={`absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 ${chromeTransition} ${chromeState}`}
        >
          <p className="metadata text-[11px] uppercase tracking-[0.08em] text-bone-dim">
            {label}
          </p>
          <button ref={closeRef} type="button" onClick={onClose} className={buttonClass}>
            Esc — Close
          </button>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 border-t border-ink-line bg-ink/85 p-4 ${chromeTransition} ${chromeState}`}
        >
          {muted && (
            <button
              type="button"
              onClick={() => applyMuted(false)}
              className="metadata self-start text-[11px] uppercase tracking-[0.08em] px-2 py-1 rounded-[2px] border border-safelight text-safelight hover:text-bone hover:border-bone focus-visible:outline-1 focus-visible:outline-bone"
            >
              Sound off — unmute
            </button>
          )}

          <div className="relative h-3 w-full has-focus-visible:outline-1 has-focus-visible:outline-safelight">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink-line" />
            {buffered.map((span) => (
              <div
                key={`${span.start}-${span.end}`}
                className="absolute top-1/2 h-px -translate-y-1/2 bg-bone-dim/50"
                style={{
                  left: `${(span.start / safeDuration) * 100}%`,
                  width: `${((span.end - span.start) / safeDuration) * 100}%`,
                }}
              />
            ))}
            <div
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-safelight"
              style={{ width: `${playedFraction * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={safeDuration}
              step={1 / TIMECODE_FPS}
              value={Math.min(currentTime, safeDuration)}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(safeDuration)}
              aria-valuenow={Math.round(currentTime)}
              aria-valuetext={timecodeOf(currentTime)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setCurrentTime(next);
                const video = videoRef.current;
                if (video) video.currentTime = next;
              }}
              className={`absolute inset-0 h-3 ${rangeClass}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={togglePlay} className={buttonClass}>
              {playing ? 'Pause' : 'Play'}
            </button>

            <p className="metadata text-[11px] tabular-nums text-bone">
              {timecodeOf(currentTime)}
              <span className="text-bone-dim"> / {timecodeOf(duration)}</span>
            </p>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => applyMuted(!muted)}
                className={buttonClass}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                aria-valuetext={`${Math.round(volume * 100)} percent`}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setVolume(next);
                  const video = videoRef.current;
                  if (video) video.volume = next;
                }}
                className={`h-3 w-24 border-b border-ink-line ${rangeClass}`}
              />

              <button type="button" onClick={toggleFullscreen} className={buttonClass}>
                {fullscreen ? 'Exit full' : 'Full screen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
