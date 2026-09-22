import { Suspense, lazy } from 'react';
import { HeroPlate } from './HeroPlate';
import { Act, Scene, Curtain } from './curtain/Act';
import { WhyCurtain } from './panels/WhyCurtain';
import { CraftCurtain } from './panels/CraftCurtain';
import { FeedbackCurtain } from './panels/FeedbackCurtain';
import { ProcessScene } from './panels/ProcessScene';
import { BookCurtain } from './panels/BookCurtain';
import { DeferUntilNear } from '@/components/ui/DeferUntilNear';
import { Meta } from '@/components/seo/Meta';

const GradeWheels = lazy(() =>
  import('@/components/grade/GradeWheels').then((m) => ({ default: m.GradeWheels })),
);

const SelectsScene = lazy(() =>
  import('./panels/SelectsScene').then((m) => ({ default: m.SelectsScene })),
);

const StillsScene = lazy(() =>
  import('./panels/StillsScene').then((m) => ({ default: m.StillsScene })),
);

/**
 * The home page is one staged run rather than a stack of sections, and the same
 * run at every width — see the `.act` block in theme.css for how it moves.
 *
 * Two rules hold the performance line here. The hero sits outside every lazy
 * boundary because it holds the LCP image; and deferred content is mounted
 * *inside* a pin, never around an act, because act geometry has to stay
 * constant or every sticky range below it shifts when a subtree arrives.
 */
export function ReelRoute() {
  return (
    <>
      <Meta
        description="Wedding and cinematic film editor based in West Bengal, India. Watch the reel, browse selects, and book the edit."
        video="/og/reel.mp4"
      />

      <Act>
        {/* The hero is already on screen at load, so it needs less hold than a
            scene that has to be revealed from behind a departing curtain. */}
        <Scene hold={0.6}>
          <HeroPlate />
        </Scene>
        <Curtain dwell={0.7}>
          <WhyCurtain />
        </Curtain>
      </Act>

      <Act>
        <Scene>
          <DeferUntilNear minHeight={0} rootMargin="600px 0px" className="h-full">
            <Suspense fallback={null}>
              <SelectsScene />
            </Suspense>
          </DeferUntilNear>
        </Scene>
        <Curtain>
          <CraftCurtain />
        </Curtain>
      </Act>

      <Act>
        <Scene>
          <DeferUntilNear minHeight={0} rootMargin="600px 0px" className="h-full">
            <Suspense fallback={null}>
              <StillsScene />
            </Suspense>
          </DeferUntilNear>
        </Scene>
        <Curtain>
          <FeedbackCurtain />
        </Curtain>
      </Act>

      <Act>
        <Scene hold={1} className="bg-ink">
          <ProcessScene />
        </Scene>
        <Curtain dwell={0.4}>
          <BookCurtain />
        </Curtain>
      </Act>

      <Suspense fallback={null}>
        <GradeWheels />
      </Suspense>
    </>
  );
}
