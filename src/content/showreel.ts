import { z } from 'zod';

const ShowreelSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationSeconds: z.number().positive(),
  poster: z.object({
    avif: z.string(),
    jpg: z.string(),
  }),
  sources: z.object({
    h1080: z.string(),
    h720: z.string(),
  }),
});

export type Showreel = z.infer<typeof ShowreelSchema>;

export const showreel = ShowreelSchema.parse({
  title: 'Showreel — Suman x Sumita',
  description:
    'A full Bengali wedding film cut down to its spine: the drone approach at first light, the ceremony, the portraits after. Graded and mastered in house. Sound on.',
  durationSeconds: 75.3,
  poster: {
    avif: '/assets/showreel/poster.avif',
    jpg: '/assets/showreel/poster.jpg',
  },
  sources: {
    h1080: '/assets/showreel/showreel-1080p.mp4',
    h720: '/assets/showreel/showreel-720p.mp4',
  },
});
