export type { VideoProvider } from '@/lib/video/provider';

export interface MediaCapability {
  allowMotion: boolean;
  allowVideoPreview: boolean;
  allowHeroVideo: boolean;
  allowWebgl: boolean;
  tier: 'high' | 'base';
}
