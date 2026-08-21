import { ProcessBeatSchema } from './schema';

const processData = [
  {
    id: 'ingest',
    label: 'Ingest',
    body: 'Every card is checksummed on arrival and mirrored to a primary and offsite drive before a single frame is touched. Proxies are generated at half-res ProRes for a fluid edit.',
    image: '/assets/process/ingest.avif',
  },
  {
    id: 'assembly',
    label: 'Assembly',
    body: 'A documentary-first pass: the day is logged and structured around its emotional beats before pacing or music enters the room. Ratio is typically 8–12:1 for a wedding day.',
    image: '/assets/process/timeline.avif',
  },
  {
    id: 'grade',
    label: 'Grade',
    body: 'Colour is finished in an ACES workflow biased toward Vision3 warmth, then delivered as a mastered ProRes 4444 XQ with H.264 and web-ready derivatives for sharing.',
    image: '/assets/process/color_grade.avif',
  },
];

export const process = processData.map((beat) => ProcessBeatSchema.parse(beat));
