import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router';
import { PositioningStatement } from '../PositioningStatement';
import { CtaBand } from '../CtaBand';
import { DeferUntilNear } from '@/components/ui/DeferUntilNear';
import { scrollToSection } from '@/lib/scroll';
import { MobileSelects } from './MobileSelects';
import { MobileNumbers } from './MobileNumbers';
import { MobileProcess } from './MobileProcess';
import { MobileStills } from './MobileStills';
import { MobilePackages } from './MobilePackages';
import { MobileExperience } from './MobileExperience';
import { MobileTestimonials } from './MobileTestimonials';
import { MobileAbout } from './MobileAbout';

const MobileContact = lazy(() =>
  import('./MobileContact').then((m) => ({ default: m.MobileContact })),
);

/**
 * Everything below the hero on a phone: each route's content stitched into one
 * page in order, every part behind its own slate so the seams read as
 * deliberate. The standalone routes stay live for deep links, sharing and
 * crawlers — on a phone the header points at these anchors instead.
 */
export function MobileHome() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    // A frame's grace so the target is laid out before Lenis is sent to it.
    const frame = requestAnimationFrame(() => scrollToSection(hash));
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <>
      <PositioningStatement />
      <MobileSelects />
      <MobileNumbers />
      <MobileProcess />
      <MobileStills />
      <MobilePackages />
      <MobileExperience />
      <MobileTestimonials />
      <MobileAbout />

      {/* The enquiry form drags in react-hook-form and zod; hold it until asked. */}
      <DeferUntilNear minHeight={760}>
        <Suspense fallback={<div className="min-h-[760px]" />}>
          <MobileContact />
        </Suspense>
      </DeferUntilNear>

      <CtaBand />
    </>
  );
}
