import { Outlet, useLocation } from 'react-router';
import { Suspense, lazy, useEffect } from 'react';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { SafeAreaGuides } from '@/components/chrome/SafeAreaGuides';
import { Timecode } from '@/components/chrome/Timecode';
import { AudioToggle } from '@/components/chrome/AudioToggle';
import { CutTransition } from '@/components/chrome/CutTransition';
import { useLenis } from '@/hooks/useLenis';
import { initAnalytics, trackPageview } from '@/lib/analytics';

const MediaDiagnostics = lazy(() =>
  import('@/components/media/MediaDiagnostics').then((m) => ({
    default: m.MediaDiagnostics,
  })),
);

export default function App() {
  useLenis();
  const location = useLocation();
  const showDiagnostics = new URLSearchParams(location.search).get('diag') === 'media';

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink text-bone selection:bg-safelight selection:text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-safelight focus:text-ink focus:px-4 focus:py-2 metadata"
      >
        Skip to content
      </a>
      <CutTransition />
      <SafeAreaGuides />
      <Header />
      <Timecode />
      <AudioToggle />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 w-full min-h-screen focus:outline-none"
      >
        <Suspense fallback={<div className="min-h-screen bg-ink" />}>
          <Outlet />
        </Suspense>
      </main>

      {showDiagnostics && (
        <Suspense fallback={null}>
          <MediaDiagnostics />
        </Suspense>
      )}
      <Footer />
    </div>
  );
}
