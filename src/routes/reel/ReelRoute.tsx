import { HeroPlate } from './HeroPlate';
import { PositioningStatement } from './PositioningStatement';
import { SelectsStrip } from './SelectsStrip';
import { NumbersRow } from './NumbersRow';
import { ProcessBeats } from './ProcessBeats';
import { Packages } from './Packages';
import { Testimonials } from './Testimonials';
import { CtaBand } from './CtaBand';
import { Meta } from '@/components/seo/Meta';

export function ReelRoute() {
  return (
    <>
      <Meta
        description="Wedding and cinematic film editor based in West Bengal, India. Watch the reel, browse selects, and book the edit."
        video="/og/reel.mp4"
      />
      <HeroPlate />
      <PositioningStatement />
      <SelectsStrip />
      <NumbersRow />
      <ProcessBeats />
      <Packages />
      <Testimonials />
      <CtaBand />
    </>
  );
}
