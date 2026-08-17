export interface PlaybackSource {
  src: string;
  type: string;
  media?: string;
}

export interface PosterOptions {
  width: number;
  time?: number;
  format: 'avif' | 'webp' | 'jpg';
}

export interface VideoProvider {
  readonly kind: 'self-hosted' | 'mux';
  playbackSources(id: string): PlaybackSource[];
  hlsUrl(id: string): string | null;
  posterUrl(id: string, opts: PosterOptions): string;
  storyboardUrl(id: string): string | null;
}

const MP4 = 'video/mp4; codecs=avc1.4D401E';

class SelfHostedProvider implements VideoProvider {
  readonly kind = 'self-hosted' as const;

  playbackSources(id: string): PlaybackSource[] {
    return [{ src: `/assets/works/${id}/full.mp4`, type: MP4 }];
  }

  hlsUrl(): string | null {
    return null;
  }

  posterUrl(id: string, opts: PosterOptions) {
    return `/assets/works/${id}/poster.${opts.format}`;
  }

  storyboardUrl(): string | null {
    return null;
  }
}

class MuxProvider implements VideoProvider {
  readonly kind = 'mux' as const;

  playbackSources(id: string): PlaybackSource[] {
    return [{ src: this.hlsUrl(id), type: 'application/vnd.apple.mpegurl' }];
  }

  hlsUrl(id: string) {
    return `https://stream.mux.com/${id}.m3u8`;
  }

  posterUrl(id: string, opts: PosterOptions) {
    const params = new URLSearchParams({
      width: String(opts.width),
      fit_mode: 'smartcrop',
    });
    if (opts.time !== undefined) params.set('time', String(opts.time));
    return `https://image.mux.com/${id}/thumbnail.${opts.format}?${params.toString()}`;
  }

  storyboardUrl(id: string) {
    return `https://image.mux.com/${id}/storyboard.vtt`;
  }
}

function createProvider(): VideoProvider {
  return import.meta.env.VITE_VIDEO_PROVIDER === 'mux'
    ? new MuxProvider()
    : new SelfHostedProvider();
}

export const videoProvider: VideoProvider = createProvider();
