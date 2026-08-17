import { StillSchema } from './schema';

const stillsData = [
  { id: '1', src: '/assets/stills/client-01.avif', frame: '01A' },
  { id: '2', src: '/assets/stills/client-02.avif', frame: '02A' },
  { id: '3', src: '/assets/stills/client-03.avif', frame: '03A' },
  { id: '4', src: '/assets/stills/client-04.avif', frame: '04A' },
  { id: '5', src: '/assets/stills/client-05.avif', frame: '05A' },
  { id: '6', src: '/assets/stills/client-06.avif', frame: '06A' },
  { id: '7', src: '/assets/stills/client-07.avif', frame: '07A' },
];

export const stills = stillsData.map((still) => StillSchema.parse(still));
