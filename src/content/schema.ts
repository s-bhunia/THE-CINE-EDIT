import { z } from 'zod';

export const TranscriptCueSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  text: z.string(),
});

export type TranscriptCue = z.infer<typeof TranscriptCueSchema>;

export const WorkSchema = z.object({
  slug: z.string(),
  title: z.string(),
  client: z.string(),
  category: z.enum([
    'Wedding Teaser',
    'Pre-Wedding',
    'Wedding Highlights',
    'Colour Grading',
  ]),
  year: z.number(),
  venue: z.string(),
  location: z.string(),
  runtimeSeconds: z.number(),
  aspect: z.string(),
  posterAvif: z.string(),
  posterWebp: z.string(),
  previewSources: z
    .object({
      av1: z.string().optional(),
      hevc: z.string().optional(),
      h264: z.string(),
    })
    .optional(),
  videoSrc: z.string(),
  captionsVtt: z.string().optional(),
  transcript: z.array(TranscriptCueSchema).optional(),
  hlsPlaybackId: z.string().optional(),
  credits: z.record(z.string(), z.string()),
  body: z.array(z.string()),
  frameGrabs: z.array(z.string()),
  featured: z.boolean(),
});

export type Work = z.infer<typeof WorkSchema>;

export const StillSchema = z.object({
  id: z.string(),
  src: z.string(),
  frame: z.string(),
});

export type Still = z.infer<typeof StillSchema>;

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  track: z.enum(['V2', 'V1', 'A1', 'FX']),
  title: z.string(),
  role: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  detail: z.string(),
});

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

export const ProcessBeatSchema = z.object({
  id: z.string(),
  label: z.string(),
  body: z.string(),
  image: z.string(),
});

export type ProcessBeat = z.infer<typeof ProcessBeatSchema>;

export const TestimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  name: z.string(),
  venue: z.string(),
  year: z.number(),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

export const ServiceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

export const EditCraftSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type EditCraft = z.infer<typeof EditCraftSchema>;

export const AboutContentSchema = z.object({
  bio: z.array(z.string()),
  philosophy: z.string(),
  gear: z.record(z.string(), z.string()),
  producerNotes: z.record(z.string(), z.string()),
});

export type AboutContent = z.infer<typeof AboutContentSchema>;
