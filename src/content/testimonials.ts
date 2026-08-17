import { TestimonialSchema } from './schema';

const testimonialsData = [
  {
    id: 'ananya-rohan',
    quote:
      'We watched our film and forgot we were watching an edit. It felt like being handed the day back, but truer.',
    name: 'Ananya & Rohan',
    venue: 'Digha, West Bengal',
    year: 2025,
  },
  {
    id: 'piyali-sourav',
    quote:
      'Manas understood the rhythm of our ceremony better than we did. The sound design alone made three separate relatives cry.',
    name: 'Piyali & Sourav',
    venue: 'Kolkata, West Bengal',
    year: 2024,
  },
  {
    id: 'debjani-arka',
    quote:
      'On time, every time, and the colour grade alone made our reception footage look like a different budget of film entirely.',
    name: 'Debjani & Arka',
    venue: 'Egra, West Bengal',
    year: 2024,
  },
];

export const testimonials = testimonialsData.map((t) => TestimonialSchema.parse(t));
