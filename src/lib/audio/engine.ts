export type SpriteId =
  'tape-click' | 'reel-spool' | 'shutter' | 'sub-thud' | 'slate-clap';

const SPRITES: Record<SpriteId, readonly [number, number]> = {
  'tape-click': [0, 0.15],
  'reel-spool': [0.5, 0.4],
  shutter: [1.2, 0.2],
  'sub-thud': [1.8, 0.35],
  'slate-clap': [2.5, 0.2],
};

const SPRITE_BUS_NOMINAL_GAIN = 0.5;
const SPRITE_BUS_DUCKED_GAIN = SPRITE_BUS_NOMINAL_GAIN * 0.25;
const DUCK_TIME_CONSTANT = 0.08;
const MEDIA_RAMP_TIME_CONSTANT = 0.13;
const PREFS_KEY = 'audioPrefs';

type MutedListener = (muted: boolean) => void;

interface AudioPrefs {
  /** Interface sound — the sprite bus behind the AudioToggle. */
  muted: boolean;
  /** Film sound in the overlay and case-study players. */
  mediaMuted: boolean;
}

/** Both buses are on unless the visitor has turned one off. */
const DEFAULT_PREFS: AudioPrefs = { muted: false, mediaMuted: false };

function readStoredPrefs(): AudioPrefs {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_PREFS };
    const record = parsed as Record<string, unknown>;
    return {
      muted: 'muted' in record ? Boolean(record.muted) : DEFAULT_PREFS.muted,
      mediaMuted:
        'mediaMuted' in record ? Boolean(record.mediaMuted) : DEFAULT_PREFS.mediaMuted,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private spriteBuffer: AudioBuffer | null = null;
  private spriteBus: GainNode | null = null;
  private mediaBus: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private levelBuffer: Uint8Array<ArrayBuffer> | null = null;
  private sources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private audibleMedia = new Set<HTMLMediaElement>();
  private prefs = readStoredPrefs();
  private ready = false;
  private pending: Promise<void> | null = null;
  private listeners = new Set<MutedListener>();

  isMuted = () => this.prefs.muted;

  isMediaMuted = () => this.prefs.mediaMuted;

  isDucking = () => this.audibleMedia.size > 0;

  subscribe = (listener: MutedListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    for (const listener of this.listeners) listener(this.prefs.muted);
  }

  private persist() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {}
  }

  private wake() {
    void this.init().then(() => {
      if (this.ctx?.state === 'suspended') void this.ctx.resume();
    });
  }

  init = (): Promise<void> => {
    if (this.pending) return this.pending;

    this.pending = (async () => {
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;

        const ctx = new Ctor();
        this.ctx = ctx;

        this.spriteBus = ctx.createGain();
        this.spriteBus.gain.value = SPRITE_BUS_NOMINAL_GAIN;
        this.spriteBus.connect(ctx.destination);

        this.mediaBus = ctx.createGain();
        this.mediaBus.gain.value = 1;

        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.75;
        this.levelBuffer = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));

        this.mediaBus.connect(this.analyser);
        this.analyser.connect(ctx.destination);

        const canPlayWebm = new Audio().canPlayType('audio/webm; codecs="opus"') !== '';
        const src = canPlayWebm ? '/audio/ui-sprite.webm' : '/audio/ui-sprite.m4a';
        const response = await fetch(src);
        if (!response.ok) throw new Error(`sprite fetch ${response.status}`);
        this.spriteBuffer = await ctx.decodeAudioData(await response.arrayBuffer());

        this.ready = true;
      } catch (error) {
        console.warn('Audio engine unavailable', error);
      }
    })();

    return this.pending;
  };

  play = (spriteId: SpriteId) => {
    if (!this.ready || this.prefs.muted) return;
    const ctx = this.ctx;
    const bus = this.spriteBus;
    const buffer = this.spriteBuffer;
    if (!ctx || !bus || !buffer) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const [start, duration] = SPRITES[spriteId];
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(bus);
    source.start(0, start, duration);
  };

  toggleMute = () => {
    this.prefs.muted = !this.prefs.muted;
    this.persist();
    if (!this.prefs.muted) this.wake();
    this.emit();
    return this.prefs.muted;
  };

  /**
   * Remembers whether film sound is on so the choice carries across routes and
   * visits. Kept separate from `muted`, which only covers interface sound.
   */
  setMediaMuted = (next: boolean) => {
    this.prefs.mediaMuted = next;
    this.persist();
    if (!next) this.wake();
  };

  private setSpriteBusGain(target: number) {
    const ctx = this.ctx;
    const bus = this.spriteBus;
    if (!ctx || !bus) return;
    bus.gain.setTargetAtTime(target, ctx.currentTime, DUCK_TIME_CONSTANT);
  }

  private syncDuck() {
    this.setSpriteBusGain(
      this.audibleMedia.size > 0 ? SPRITE_BUS_DUCKED_GAIN : SPRITE_BUS_NOMINAL_GAIN,
    );
  }

  private route(element: HTMLMediaElement) {
    const ctx = this.ctx;
    const bus = this.mediaBus;
    if (!ctx || !bus || this.sources.has(element)) return;
    try {
      const source = ctx.createMediaElementSource(element);
      source.connect(bus);
      this.sources.set(element, source);
    } catch {}
  }

  registerMedia = (element: HTMLMediaElement) => {
    const markAudible = () => {
      if (element.muted || element.volume === 0 || element.paused) {
        this.audibleMedia.delete(element);
      } else {
        if (this.ready) this.route(element);
        this.audibleMedia.add(element);
        if (this.ctx?.state === 'suspended') void this.ctx.resume();
      }
      this.syncDuck();
    };

    const markSilent = () => {
      this.audibleMedia.delete(element);
      this.syncDuck();
    };

    element.addEventListener('play', markAudible);
    element.addEventListener('volumechange', markAudible);
    element.addEventListener('pause', markSilent);
    element.addEventListener('ended', markSilent);
    element.addEventListener('emptied', markSilent);

    return () => {
      element.removeEventListener('play', markAudible);
      element.removeEventListener('volumechange', markAudible);
      element.removeEventListener('pause', markSilent);
      element.removeEventListener('ended', markSilent);
      element.removeEventListener('emptied', markSilent);
      markSilent();
    };
  };

  rampMediaGain = (target: number) => {
    const ctx = this.ctx;
    const bus = this.mediaBus;
    if (!ctx || !bus) return;
    if (ctx.state === 'suspended') void ctx.resume();
    bus.gain.setTargetAtTime(target, ctx.currentTime, MEDIA_RAMP_TIME_CONSTANT);
  };

  getLevel = () => {
    const analyser = this.analyser;
    const buffer = this.levelBuffer;
    if (!analyser || !buffer || this.audibleMedia.size === 0) return 0;
    analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const sample = ((buffer[i] ?? 128) - 128) / 128;
      sum += sample * sample;
    }
    return Math.min(1, Math.sqrt(sum / buffer.length) * 3);
  };
}

export const audioEngine = new AudioEngine();
