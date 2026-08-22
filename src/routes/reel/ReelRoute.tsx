import { Suspense, lazy } from 'react';
import { HeroPlate } from './HeroPlate';
import { PositioningStatement } from './PositioningStatement';
import { SelectsStrip } from './SelectsStrip';
import { NumbersRow } from './NumbersRow';
import { ProcessBeats } from './ProcessBeats';
import { Packages } from './Packages';
import { Testimonials } from './Testimonials';
import { CtaBand } from './CtaBand';
import { Meta } from '@/components/seo/Meta';
import { useIsPhone } from '@/hooks/useIsPhone';

const GradeWheels = lazy(() =>
  import('@/components/grade/GradeWheels').then((m) => ({ default: m.GradeWheels })),
);

/*
 * Phone-only, and lazy so the initial chunk stays inside its budget. The hero
 * deliberately sits outside the boundary: it holds the LCP image, and rendering
 * it as the Suspense fallback too would mount it twice and restart the wordmark
 * animation the moment the chunk landed.
 */
const MobileSections = lazy(() =>
  import('./mobile/MobileHome').then((m) => ({ default: m.MobileHome })),
);

export function ReelRoute() {
  const isPhone = useIsPhone();

  return (
    <>
      <Meta
        description="Wedding and cinematic film editor based in West Bengal, India. Watch the reel, browse selects, and book the edit."
        video="/og/reel.mp4"
      />

      <HeroPlate />

      {isPhone ? (
        <Suspense fallback={null}>
          <MobileSections />
        </Suspense>
      ) : (
        <>
          <PositioningStatement />
          <SelectsStrip />
          <NumbersRow />
          <ProcessBeats />
          <Packages />
          <Testimonials />
          <CtaBand />
        </>
      )}

      <Suspense fallback={null}>
        <GradeWheels />
      </Suspense>
    </>
  );
}
