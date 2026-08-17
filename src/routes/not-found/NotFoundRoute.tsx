import { Link } from 'react-router';

export function NotFoundRoute() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6 relative overflow-hidden">
      <title>Media Offline — THE CINE EDIT</title>
      <meta name="robots" content="noindex" />
      <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')] mix-blend-overlay pointer-events-none" />

      <div className="max-w-2xl w-full border-2 border-safelight p-12 text-center bg-safelight/5">
        <h1 className="font-mono text-4xl md:text-5xl text-safelight tracking-tighter mb-4">
          MEDIA OFFLINE
        </h1>

        <div className="metadata text-bone-dim flex flex-col gap-2 mb-12">
          <span>ERR_CLIP_NOT_FOUND_IN_BIN</span>
          <span>PATH: {window.location.pathname}</span>
          <span>STATUS: UNLINKED</span>
        </div>

        <Link
          to="/work"
          className="metadata text-bone border border-ink-line px-6 py-3 hover:text-safelight hover:border-safelight transition-colors bg-ink-raise"
        >
          ◂ RELINK TO SELECTS
        </Link>
      </div>
    </div>
  );
}
