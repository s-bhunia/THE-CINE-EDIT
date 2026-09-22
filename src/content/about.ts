import { AboutContentSchema } from './schema';

export const about = AboutContentSchema.parse({
  // The opening line lives in `philosophy`, which the page sets as the large
  // pull quote — repeating it here printed the same sentence twice.
  bio: [
    'Every project moves through the same discipline regardless of scale: wedding storytelling structured around the day’s real emotional beats, a professional edit pass, cinematic colour grading, and sound design — delivered on time, every time.',
  ],
  philosophy:
    'I am Manas, creating emotional, cinematic wedding films that turn real moments into stories you can relive forever.',
  gear: {
    NLE: 'DaVinci Resolve Studio',
    Storage: '120TB TrueNAS ZFS Pool',
    Monitoring: 'Flanders Scientific',
    Audio: 'Genelec 8030C',
  },
  producerNotes: {
    Delivery: 'ProRes 4444 XQ master, H.264 web derivative, vertical cutdowns on request',
    'Colour workflow':
      'ACES-managed, graded in DaVinci Resolve, LUTs supplied on request',
    'Round-trip': 'XML/AAF exchange tested against Premiere Pro and Avid Media Composer',
    'Proxy workflow': 'Half-res ProRes proxies generated at ingest, relinked at export',
    Backup: '3-2-1: primary NAS, offsite mirror, cold archive per project',
  },
});
