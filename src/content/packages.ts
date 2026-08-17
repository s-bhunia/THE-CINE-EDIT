import { ServiceCategorySchema, EditCraftSchema } from './schema';

const serviceCategoriesData = [
  { id: 'wedding-film', name: 'Wedding Film' },
  { id: 'wedding-teaser', name: 'Wedding Teaser' },
  { id: 'wedding-highlights', name: 'Wedding Highlights' },
  { id: 'pre-wedding', name: 'Pre-Wedding' },
  { id: 'wedding-anniversary', name: 'Wedding Anniversary' },
  { id: 'engagement', name: 'Engagement' },
  { id: 'rice-ceremony', name: 'Rice Ceremony' },
  { id: 'birthday', name: 'Birthday' },
  { id: 'any-event', name: 'Any Event' },
];

const editCraftData = [
  { id: 'storytelling', name: 'Wedding Storytelling' },
  { id: 'professional-edit', name: 'Professional Edit' },
  { id: 'cinematic-editing', name: 'Cinematic Editing' },
  { id: 'colour-grading', name: 'Cinematic Colour Grading' },
  { id: 'sound-design', name: 'Sound Design' },
  { id: 'on-time-delivery', name: 'On-Time Delivery' },
];

export const serviceCategories = serviceCategoriesData.map((s) =>
  ServiceCategorySchema.parse(s),
);
export const editCraft = editCraftData.map((c) => EditCraftSchema.parse(c));
