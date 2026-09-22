import { z } from 'zod';

const SiteSchema = z.object({
  name: z.string(),
  origin: z.string().url(),
  tagline: z.string(),
  editor: z.string(),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    phoneLink: z.string(),
    whatsapp: z.string(),
    whatsappLink: z.string(),
    instagram: z.string(),
    instagramLink: z.string().url(),
    facebook: z.string(),
    facebookLink: z.string().url(),
    location: z.string(),
    locationLink: z.string(),
  }),
  availability: z.string(),
  positioning: z.object({
    statement: z.string(),
    answer: z.string(),
    attribution: z.string(),
  }),
  stats: z.object({
    projectsDelivered: z.number(),
    clients: z.number(),
  }),
});

export const site = SiteSchema.parse({
  name: 'THE CINE EDIT',
  origin: 'https://the-cine-edit.vercel.app',
  tagline: 'Great Footage Deserves Great Editing.',
  editor: 'Manas Bera',
  contact: {
    email: 'thecineeditwork@gmail.com',
    phone: '+91 8348262443',
    phoneLink: 'tel:+918348262443',
    whatsapp: '+91 8348262443',
    whatsappLink: 'https://wa.me/918348262443',
    instagram: '@the_cine_edit',
    instagramLink: 'https://www.instagram.com/the_cine_edit/',
    facebook: 'The Cine Edit',
    facebookLink: 'https://www.facebook.com/profile.php?id=61572163490173',
    location: 'Club more, chhatreswar mandir, Chhatri, Egra, West Bengal 721429',
    locationLink: 'https://maps.app.goo.gl/uzqyRk58JJiypZfD6',
  },
  availability: 'BOOKING — AUTUMN 2026',
  positioning: {
    statement: 'Great Footage Deserves Great Editing.',
    answer:
      'Beautiful coverage is only half a film. What turns a day into something you will sit down and watch again is the cut — the order of it, the pacing, the grade, the sound. That is the whole of the work here: your footage structured around the beats that actually mattered, finished to the standard you would expect of a feature, and delivered when it was promised.',
    attribution: 'MANAS BERA, EDITOR',
  },
  stats: {
    projectsDelivered: 3000,
    clients: 1000,
  },
});
