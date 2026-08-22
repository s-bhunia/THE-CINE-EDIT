# THE CINE EDIT — Studio Portfolio

Portfolio site for Manas Bera, a wedding and cinematic film editor based in West Bengal, India. It is a single-page React application built around self-hosted video: an NLE-inspired interface where the work itself (teasers, pre-wedding films, highlights reels, colour grades) is the primary content.

Production origin: `https://the-cine-edit.vercel.app`

## Stack

| Layer    | Choice                                                         |
| -------- | -------------------------------------------------------------- |
| Build    | Vite 8                                                         |
| UI       | React 19, React Router 7 (`createBrowserRouter`)               |
| Language | TypeScript 6, `strict` + `noUncheckedIndexedAccess`            |
| Styling  | Tailwind CSS v4 (via `@tailwindcss/vite`, no config file)      |
| Content  | Typed modules in `src/content/`, validated with Zod 4          |
| Motion   | `motion` (Framer Motion successor), `lenis` for smooth scroll  |
| 3D       | `three` (direct) + raw WebGL2 — deliberately no R3F, see below |
| Video    | `hls.js`, behind a provider abstraction                        |
| Forms    | `react-hook-form` + `@hookform/resolvers/zod`                  |
| Lint     | `oxlint`                                                       |
| Test     | Vitest (unit, jsdom), Playwright + axe (e2e / a11y)            |
| Deploy   | Vercel (static SPA + one Edge function)                        |

Package manager is **pnpm**. Path alias `@/*` maps to `src/*`.

## Running it

```bash
pnpm install
pnpm dev            # Vite dev server
pnpm build          # sitemap -> tsc -b -> vite build
pnpm preview        # serve the production build locally
pnpm typecheck      # tsc -b across src, scripts, vite.config, and api/
pnpm lint           # oxlint
pnpm format         # prettier --write .
pnpm test           # vitest run
pnpm e2e            # playwright test
pnpm check-budgets  # size budgets against dist/ (run after a build)
pnpm build:sitemap  # regenerate public/sitemap.xml on its own
pnpm build:showreel # re-encode the showreel from source footage (needs ffmpeg)
pnpm build:portrait # regrade the About portrait from assets/source/headshot.png
pnpm build:videos   # re-encode every source clip to <20MB web derivatives (needs ffmpeg)
pnpm subset-fonts   # resubset public/fonts (needs Python + fontTools)
```

`pnpm build` regenerates `public/sitemap.xml` before compiling, so the sitemap can never drift from `src/content/works.ts`.

### House rule: no comments in source

This codebase deliberately contains **no code comments** in any source file — no `//`, no `/* */`, no `{/* */}` in JSX. Non-obvious code should be made obvious with names and structure instead. Config files (`.env.example`, `robots.txt`, JSON, this README) are exempt.

## The real-asset pipeline

Video is self-hosted, not on a CDN. Raw camera exports are kept out of the served tree and compressed into web-ready derivatives by scripts in `scripts/`. All scripts are plain ESM and are run with `node`; the video ones shell out to **ffmpeg**, which must be on your `PATH`. Image work uses `sharp` (already a devDependency).

### Source layout

```
assets/source/headshot.png      source headshot for the About portrait
public/assets/video/**          source clips, organised by shoot type
  WEDDING TEASER/
  pre wedding reels/
  wedding reels/
  color greding reels/
public/assets/photo/**          source stills
public/assets/works/<slug>/     generated per-work derivatives
public/assets/showreel/         generated showreel encodes + poster
public/assets/hero/             generated hero loop
public/assets/about/            generated portrait derivatives
public/fonts/                   generated font subsets
```

`public/assets/video/` and `public/assets/photo/` hold **~4.9 GB of raw camera exports**. Vite copies `public/` into `dist/` verbatim, which produced a 5.1 GB build output and made the site undeployable. The `prune-source-media` plugin in `vite.config.ts` deletes those two directories from `dist/` after the copy, bringing the output to ~164 MB. It only ever touches `dist/`, never the sources.

Those raw directories properly belong outside `public/` (as `assets/source/`, where the headshot now lives). Moving them is the better fix and would let the plugin be deleted — the plugin exists so that a build is correct whether or not that move has happened. If you move them, update the `source` paths in `scripts/build-real-works.mjs` and `SOURCE` in `scripts/build-showreel.mjs`.

### `scripts/build-real-works.mjs` — per-work derivatives

```bash
node scripts/build-real-works.mjs
```

Takes **no arguments**. The work list is a hardcoded `WORKS` array at the top of the script; each entry declares `slug`, `source` (path to the raw clip), `posterAt`, `grabsAt` (array of timestamps in seconds), `previewStart`, and `previewDuration`. To process a new clip you edit that array.

For each entry it writes into `public/assets/works/<slug>/`:

| File          | How it is made                                                           |
| ------------- | ------------------------------------------------------------------------ |
| `full.mp4`    | libx264 crf 25, max 4M, AAC 128k audio, `+faststart`                     |
| `preview.mp4` | silent 960px-wide clip from `previewStart` for `previewDuration`, crf 30 |
| `poster.avif` | frame at `posterAt`, AVIF quality 60                                     |
| `poster.webp` | same frame, WebP quality 70                                              |
| `grab-N.avif` | one AVIF per timestamp in `grabsAt`, 1-indexed                           |

Intermediate JPEGs are deleted automatically.

### `scripts/encode-hero.mjs` — the homepage hero loop

```bash
node scripts/encode-hero.mjs "public/assets/video/WEDDING TEASER/Sequence 06_18.mp4"
```

Takes **one positional argument**: the input video path. Exits 1 if it is missing or does not exist. Writes to `public/assets/hero/`: `loop-1080p.mp4` (H.264 high/4.2, crf 24, audio stripped), `loop-720p.mp4` (crf 26, mobile fallback), and `poster.jpg` (first frame).

### `scripts/build-posters.mjs` — standalone image derivatives

```bash
node scripts/build-posters.mjs
```

Takes **no arguments**. Reads every `.jpg/.jpeg/.png` in `assets/raw-posters/` (note: repo root, _not_ `public/`) and writes AVIF + WebP at widths 400, 800, and 1600 into `public/assets/works/` as `<name>-<width>.<ext>`. Silently does nothing if the input directory is absent. This is the escape hatch for stills that did not come from a video frame; the per-work posters come from `build-real-works.mjs`.

### `scripts/subset-fonts.mjs` — fonts

```bash
pnpm subset-fonts
```

Takes **no arguments**. Subsets the three latin variable fonts (Fraunces, Instrument Sans, Geist Mono) from `node_modules/@fontsource-variable/*` into `public/fonts/`, retaining only the codepoints the site uses and dropping unused OpenType features. Rerun it after changing a font dependency or introducing new glyphs.

This script needs **Python with fontTools**, which is not an npm dependency:

```bash
python -m pip install "fonttools[woff]"
```

Point `PYTHON` at a different interpreter if `python` is not the one you want (`PYTHON=python3 pnpm subset-fonts`). The script fails fast with that install hint if `import fontTools` does not resolve. Subsetting is what brings the three files from ~170 KB to **113 KB**, under the 120 KB budget — the unsubsetted copies exceed it, so this step is load-bearing, not an optimisation.

## Adding a new work

1. **Drop the source clip in** under `public/assets/video/<some folder>/`. Keep the original; it is the master.
2. **Register it for encoding.** Add an entry to the `WORKS` array at the top of `scripts/build-real-works.mjs` with a URL-safe `slug`, the `source` path, a `posterAt` second, three `grabsAt` seconds, and a `previewStart`/`previewDuration` for the hover preview.
3. **Encode**: `node scripts/build-real-works.mjs`. Confirm `public/assets/works/<slug>/` now holds `full.mp4`, `preview.mp4`, `poster.avif`, `poster.webp`, `grab-1..3.avif`.
4. **Add the content entry** to `src/content/works.ts`, using the same `slug`. It is validated against `WorkSchema` in `src/content/schema.ts`. Required fields:

   | Field            | Type                                                                            |
   | ---------------- | ------------------------------------------------------------------------------- |
   | `slug`           | string — must match the asset folder name                                       |
   | `title`          | string                                                                          |
   | `client`         | string                                                                          |
   | `category`       | `'Wedding Teaser' \| 'Pre-Wedding' \| 'Wedding Highlights' \| 'Colour Grading'` |
   | `year`           | number                                                                          |
   | `venue`          | string                                                                          |
   | `location`       | string                                                                          |
   | `runtimeSeconds` | number                                                                          |
   | `aspect`         | string (e.g. `'16/9'`)                                                          |
   | `posterAvif`     | string path                                                                     |
   | `posterWebp`     | string path                                                                     |
   | `videoSrc`       | string path                                                                     |
   | `credits`        | `Record<string, string>`                                                        |
   | `body`           | `string[]` — paragraphs for the case-study page                                 |
   | `frameGrabs`     | `string[]` — paths to the `grab-N.avif` files                                   |
   | `featured`       | boolean                                                                         |

   Optional: `previewSources` (`{ av1?, hevc?, h264 }` — `h264` required if the object is present) and `hlsPlaybackId`.

5. **Rebuild**: `pnpm build`.

The Zod `parse` runs at **module scope**, not lazily. A malformed entry throws while the module is being evaluated, which means it fails `vite build` and your unit tests — it never reaches a browser as a silent-empty card. Treat a schema error as a build error, not a runtime bug.

The sitemap picks up the new slug automatically: `scripts/build-sitemap.mjs` regexes `slug: '...'` out of `src/content/works.ts` and emits `/work/<slug>` for each. If that regex ever matches zero slugs the script exits 1 with an explanation rather than writing an empty sitemap, so a refactor of `works.ts` fails the build loudly.

## Swapping the video provider

Video URLs are resolved through the `VideoProvider` interface in **`src/lib/video/provider.ts`** (`hlsUrl`, `posterUrl`, `storyboardUrl`). The shipped implementation is `SelfHostedProvider`, which maps IDs onto `/media/<id>/…`.

To move to a hosted service such as Mux:

1. Add a class implementing `VideoProvider` (e.g. `src/lib/video/mux.ts`).
2. Select it from the exported `videoProvider` binding based on `import.meta.env.VITE_VIDEO_PROVIDER`.
3. Set `VITE_VIDEO_PROVIDER=mux` and `VITE_MUX_ENV_KEY=…` in the environment.
4. Populate `hlsPlaybackId` on each entry in `src/content/works.ts`.

Nothing outside `provider.ts` should reference a hosting vendor.

## Performance budgets

`scripts/check-budgets.mjs` reads `dist/.vite/manifest.json`, walks the static import graph from the entry chunk, and gzips the results. It exits 1 if any budget is exceeded, so it is safe to run as a CI gate after `pnpm build`.

| Budget                              | Limit       | Last measured |
| ----------------------------------- | ----------- | ------------- |
| Initial JS (entry + static imports) | 130 KB gzip | 123.5 KB      |
| CSS                                 | 20 KB gzip  | 7.2 KB        |
| GL chunk (three, lazy-loaded)       | 180 KB gzip | 130.4 KB      |
| Fonts (3 woff2, uncompressed)       | 120 KB      | 113.4 KB      |
| Hero loop 1080p (uncompressed)      | 2560 KB     | 1682 KB       |

Lazy route chunks are reported for information but are not individually budgeted. The GL chunk is identified by filenames containing `three` or `ReelObject` that are _not_ part of the initial graph — if the three.js code ever lands in the entry chunk, the initial-JS budget will catch it.

### Why there is no @react-three/fiber

The build prompt specified R3F + drei + postprocessing. They were removed. R3F does `import * as THREE` internally to build its component catalogue, which defeats tree-shaking of three.js entirely: the GL chunk measured **234 KB gzip against a 180 KB budget**. The brief states that when an instruction fights a performance budget, the budget wins.

Both GL surfaces were rewritten to compensate:

- `src/components/gl/useFilmPlateGl.ts` — the hero film-plate grade is **raw WebGL2** (zero dependency bytes). It is a fullscreen quad sampling the `<video>` as a texture; it never needed a scene graph.
- `src/components/gl/ReelScene.tsx` — the `/about` film reel uses **three.js directly** with named imports, so three tree-shakes.

Result: **130 KB**. Do not reintroduce R3F without re-measuring.

### Not yet measured

`scripts/check-budgets.mjs` covers **bundle sizes only**. The runtime budgets in the brief — LCP ≤ 1.8 s, INP ≤ 200 ms, CLS ≤ 0.02, TBT ≤ 150 ms, Lighthouse Perf ≥ 97 desktop / ≥ 88 mobile — have **never been measured**. An attempt failed on an npm network error while installing Lighthouse. Do not claim those budgets are met until a real throttled run exists.

```bash
pnpm build && pnpm check-budgets
```

## Deploy

Hosted on **Vercel** as a static SPA plus a single Edge function.

- **Build command**: `pnpm build` (runs the sitemap generator, `tsc -b`, then `vite build`). Output directory `dist`.
- **`vercel.json`** carries the Content-Security-Policy, `Referrer-Policy`, `X-Content-Type-Options`, HSTS, and `Permissions-Policy` headers, plus a one-year immutable `Cache-Control` on `/assets/*`. `cleanUrls` and `trailingSlash: false` are set there too. Canonical URLs in `src/components/seo/Meta.tsx` are built from `site.origin` in `src/content/site.ts` — change that constant if the domain changes, and change `ORIGIN` in `scripts/build-sitemap.mjs` and the `Sitemap:` line in `public/robots.txt` to match.
- **Environment variables** to set in the Vercel project (Production _and_ Preview):
  - `RESEND_API_KEY` — Resend API key.
  - `CONTACT_TO_EMAIL` — inbox that enquiries are delivered to.
  - Optionally `VITE_PLAUSIBLE_DOMAIN`, `VITE_VIDEO_PROVIDER`.

  See `.env.example`. Anything without the `VITE_` prefix is server-only and never reaches the browser bundle.

### The contact function

`api/contact.ts` is a Vercel Edge function that receives the enquiry form (`src/routes/contact/SlateForm.tsx`) and forwards it via the Resend REST API. It has no npm dependencies — it calls `https://api.resend.com/emails` with `fetch`. It re-validates every field server-side (the client-side Zod schema is a UX affordance, not a trust boundary), escapes user input before interpolating it into the HTML body, silently 200s on a filled honeypot, and returns 502 without detail if Resend rejects the send.

> **Before production: change `FROM_ADDRESS`.** It is currently `onboarding@resend.dev`, Resend's shared sandbox sender. That address only delivers to the account owner's own address and will look untrustworthy in an inbox. Verify a domain in Resend and set `FROM_ADDRESS` (top of `api/contact.ts`) to something like `enquiries@thecineedit.com`.

`api/` is typechecked by its own project, `tsconfig.api.json`, referenced from the root `tsconfig.json`, so `pnpm typecheck` covers it.

## Video encoding pipeline

Every source clip is encoded to a web derivative under **20 MB** by `scripts/build-web-videos.mjs` (`pnpm build:videos`), so the whole processed set can live in git and deploy straight from Vercel with no external video host.

The script derives a bitrate from a target size and the measured duration, then picks a resolution off a ladder so that bitrate-per-pixel stays sane — a four-minute film gets 480p rather than a smeared 720p:

| Rendition | Chosen when              |
| --------- | ------------------------ |
| 1280x720  | video budget >= 900 kbps |
| 960x540   | video budget >= 560 kbps |
| 854x480   | below that               |

Short reels land at 1280x720 / 2200 kbps. The three long-form pre-wedding films are the weak point: at four minutes they fall to 854x480 / ~480 kbps and are visibly softer. If those matter, trim them shorter rather than raising the cap.

A `rotate` field on a clip entry injects an ffmpeg transpose before scaling. `slog3-colour-grade` needs `transpose=2`: its source is a portrait 1080x1920 container holding landscape content turned 90 degrees, and the previous pipeline rotated it the wrong way, which is why it played upside down.

The 11 clips added in this pass carry **provisional titles and descriptions** written from their poster frames, with `venue: 'On location'` rather than invented venue names. They are accurate in category and technical detail but were not confirmed with the editor — correct them in `src/content/works.ts` before treating them as final copy.

## Content TODO — placeholder content that must be replaced

The site is engineered, but parts of it are **not yet honest**. Everything below is invented or approximate and must be replaced with confirmed information (or removed) before this is presented as a real portfolio. Shipping it as-is means publishing claims about real people that nobody has verified.

**1. Venue names on the named couple works are guesses.**
In `src/content/works.ts`:

- line 10 — `venue: 'Banquet Hall'` on `riya-weds-tarun` (line 5)
- line 42 — `venue: 'Mandarmani Beach'` on `biki-debashrita-prewedding` (line 37)

These were inferred from the footage, not confirmed by the editor or the couples. They name a real location in connection with real named clients. Confirm each with Manas, or replace them with a generic region. (The two unnamed works at lines 74 and 106 use the placeholder `'Wedding Venue'`, which is at least not a false specific.)

**2. ~~The About page portrait is not Manas Bera.~~ Resolved.**
A real studio headshot was supplied and is now in place, generated by `pnpm build:portrait` from `assets/source/headshot.png`.

The source photograph has a **saturated purple/violet backdrop**, which is the exact background §2.6 of the brief bans and which clashes with the four-colour palette. Rather than mask it with CSS blend modes (the previous markup used `mix-blend-luminosity` plus a `hover:grayscale-0` that would have revealed full purple on hover), `scripts/build-portrait.mjs` bakes a warm monochrome grade into the asset with a single `recomb` luma matrix and a per-channel warm gain — defensible as an editor grading their own portrait. It also crops 3:4 → 4:5 from the top so the face is not cut, and emits AVIF + WebP at 640 w and 1080 w for the `<picture>` in `AboutRoute.tsx`.

Note that `sharp` applies operations in a fixed internal order in which `grayscale` runs _after_ `tint`, so the obvious `.grayscale().tint()` silently discards the tint. Hence `recomb`.

**3. Every testimonial is fabricated.**
`src/content/testimonials.ts` contains three entries — `ananya-rohan`, `piyali-sourav`, `debjani-arka` — whose quotes, client names, venues, and years are all invented. They read as genuine client praise attributed to named individuals who do not exist. This is the most serious item on this list: fake testimonials are straightforwardly deceptive and, in several jurisdictions, unlawful advertising. Replace them with real, attributable quotes that the clients have agreed to publish, or delete the file and remove the testimonials section from the page that renders it.
