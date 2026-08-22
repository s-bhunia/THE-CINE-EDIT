import { useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router';
import { works } from '@/content/works';
import { Meta } from '@/components/seo/Meta';
import { AdjacentClips } from './AdjacentClips';
import { analyticsEvents } from '@/lib/analytics';
import { audioEngine } from '@/lib/audio/engine';
import { toIsoDate } from '@/lib/format/date';

export function CaseStudyRoute() {
  const { slug } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const workIndex = works.findIndex((w) => w.slug === slug);
  const work = works[workIndex];

  // Films start with sound on, and whichever way the visitor sets it here is the
  // way the next player they open starts.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = audioEngine.isMediaMuted();
    const remember = () => audioEngine.setMediaMuted(video.muted);
    video.addEventListener('volumechange', remember);
    return () => video.removeEventListener('volumechange', remember);
  }, [slug]);

  if (!work) return <Navigate to="/404" replace />;

  const prev = workIndex > 0 ? works[workIndex - 1] : works[works.length - 1];
  const next = workIndex < works.length - 1 ? works[workIndex + 1] : works[0];

  const handleShare = async () => {
    const url = window.location.href;
    analyticsEvents.caseStudyShare(work.slug);

    if (navigator.share) {
      await navigator.share({ title: work.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <article className="min-h-screen bg-ink">
      <Meta
        title={work.title}
        description={work.body[0]}
        image={work.posterAvif}
        type="video.movie"
        breadcrumbs={[
          { name: 'Reel', path: '/' },
          { name: 'Selects', path: '/work' },
          { name: work.title, path: `/work/${work.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: work.title,
          description: work.body[0],
          thumbnailUrl: `${window.location.origin}${work.posterAvif}`,
          uploadDate: toIsoDate(work.year),
          duration: `PT${Math.round(work.runtimeSeconds / 60)}M`,
        }}
      />

      <div
        className="w-full bg-black mx-auto"
        style={{
          aspectRatio: work.aspect.replace(':', '/'),
          maxHeight: '90vh',
        }}
      >
        <video
          ref={videoRef}
          src={work.videoSrc}
          controls
          preload="none"
          poster={work.posterAvif}
          className="w-full h-full object-contain"
        >
          {work.captionsVtt ? (
            <track
              kind="captions"
              src={work.captionsVtt}
              srcLang="en"
              label="English (sound descriptions)"
              default
            />
          ) : null}
        </video>
      </div>

      {work.transcript && work.transcript.length > 0 ? (
        <details className="border-b border-ink-line">
          <summary className="metadata text-sm text-bone-dim hover:text-safelight transition-colors cursor-pointer px-6 py-6 max-w-[1920px] mx-auto">
            TRANSCRIPT
          </summary>
          <div className="max-w-[1920px] mx-auto px-6 pb-12">
            <dl className="flex flex-col border-t border-ink-line max-w-[90ch]">
              {work.transcript.map((cue) => (
                <div
                  key={cue.time}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-6 border-b border-ink-line py-4"
                >
                  <dt className="metadata text-sm text-bone-dim sm:col-span-1">
                    {cue.time}
                  </dt>
                  <dd className="text-bone/90 sm:col-span-5">{cue.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
      ) : null}

      <div className="max-w-[1920px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6">
        <div className="lg:col-span-4 lg:col-start-2">
          <div className="sticky top-32">
            <h1 className="text-5xl text-bone mb-8">{work.client}</h1>
            <div className="flex flex-col gap-4 metadata text-sm border-t border-ink-line pt-6">
              <div className="grid grid-cols-3">
                <span className="text-bone-dim">Venue</span>
                <span className="col-span-2 text-bone">{work.venue}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-bone-dim">Date</span>
                <span className="col-span-2 text-bone">{work.year}</span>
              </div>

              <div className="w-full h-px bg-ink-line my-4" />

              {Object.entries(work.credits).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3">
                  <span className="text-bone-dim">{key}</span>
                  <span className="col-span-2 text-bone">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleShare}
              className="mt-8 metadata text-sm text-bone-dim hover:text-safelight transition-colors border border-ink-line px-4 py-2 rounded-sm"
            >
              SHARE ▸
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-12">
          {work.body.map((paragraph, idx) => (
            <p key={idx} className="text-lg text-bone/90 max-w-[68ch]">
              {paragraph}
            </p>
          ))}

          <div className="flex flex-col gap-6 mt-8">
            {work.frameGrabs.map((grab, idx) => (
              <img
                key={idx}
                src={grab}
                alt={`Frame grab ${idx + 1}`}
                loading="lazy"
                className="w-full h-auto bg-ink-raise"
              />
            ))}
          </div>
        </div>
      </div>

      <AdjacentClips prev={prev} next={next} />
    </article>
  );
}
