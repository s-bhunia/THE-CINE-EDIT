import { ExperienceEntrySchema } from './schema';

const experienceData = [
  {
    id: 'doc-feature-assembly',
    track: 'V2' as const,
    title: 'Doc Feature Assembly',
    role: 'Assembly Editor',
    startYear: 2019,
    endYear: 2020.5,
    detail:
      'Cut the first assembly pass on a feature-length documentary from 40 hours of interview and verite footage down to a 3-hour selects reel for the director.',
  },
  {
    id: 'freelance-studio-a',
    track: 'V1' as const,
    title: 'Freelance Editor — Studio A',
    role: 'Freelance Editor',
    startYear: 2018.25,
    endYear: 2020.25,
    detail:
      'Cut wedding highlight films and same-day-edit pieces for a regional studio, establishing the pacing and sound-design approach later carried into independent work.',
  },
  {
    id: 'senior-editor-cine-edit',
    track: 'V1' as const,
    title: 'Senior Editor — The Cine Edit',
    role: 'Senior Editor',
    startYear: 2023,
    endYear: undefined,
    detail:
      'Leading edit and color on wedding films and commercial work end to end: ingest, assembly, grade, and delivery, with a documentary-first approach to structuring a couple’s day.',
  },
];

export const experience = experienceData.map((entry) =>
  ExperienceEntrySchema.parse(entry),
);
