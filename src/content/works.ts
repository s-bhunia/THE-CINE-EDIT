import { WorkSchema } from './schema';

const worksData = [
  {
    slug: 'riya-weds-tarun',
    title: 'Riya Weds Tarun',
    client: 'Riya & Tarun',
    category: 'Wedding Teaser',
    year: 2025,
    venue: 'Banquet Hall',
    location: 'West Bengal, India',
    runtimeSeconds: 158,
    aspect: '16:9',
    posterAvif: '/assets/works/riya-weds-tarun/poster.avif',
    posterWebp: '/assets/works/riya-weds-tarun/poster.webp',
    previewSources: {
      h264: '/assets/works/riya-weds-tarun/preview.mp4',
    },
    videoSrc: '/assets/works/riya-weds-tarun/full.mp4',
    captionsVtt: '/assets/works/riya-weds-tarun/captions.vtt',
    transcript: [
      {
        time: '00:00',
        text: 'Night exterior. The decorated entrance gate to the venue, banked with red roses and pale teal fans, the couple visible in the lit doorway beyond. Title card reads “Tarun X Riya — The Cine Edit”. A soft sustained tone fades up.',
      },
      {
        time: '00:10',
        text: 'Daylight. Close on the bride’s mehendi-covered hands cradling a red painted ritual pot with Bengali lettering, marigold and rose garlands at the wrists. A rhythmic beat enters under a warm bass line.',
      },
      {
        time: '00:34',
        text: 'Decor details: an arch of red roses around a crystal chandelier, drapes in cream and gold, the studio monogram on the backdrop. The music builds.',
      },
      {
        time: '00:46',
        text: 'The ceremony itself. The groom in a white topor and red kurta reaches across the sacred fire while the priest works below; the bride sits beside him in red and gold. Layered percussion under the images.',
      },
      {
        time: '01:10',
        text: 'Portraits of the couple against the red floral arches — arms around shoulders, foreheads together, both laughing. The music builds and reaches full volume.',
      },
      {
        time: '01:30',
        text: 'The gaye holud. Women in yellow crowd in to press turmeric onto the bride’s face and cheeks, then break into dance, sarees swinging. The full arrangement plays underneath.',
      },
      {
        time: '01:52',
        text: 'The music drops away to a brief break, then the beat returns softer for a solo portrait of the bride in red, chandan drawn on her forehead, the flower arches behind her.',
      },
      {
        time: '02:22',
        text: 'Closing portraits: the couple leaning into one another, then standing back to back facing camera. The music lifts a last time and fades out.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Custom mix, licensed score',
    },
    body: [
      'A wedding teaser built around the arrival and the gate — the first real beat of the day, before the ceremony itself. The cut leans on the gold-and-red palette of the decor, letting the venue do the emotional lifting in the wides while the close-ups carry the quieter moments.',
      'Graded warm throughout, with skin tones protected against the saturated reds of the staging so the couple never gets lost in the set.',
    ],
    frameGrabs: [
      '/assets/works/riya-weds-tarun/grab-1.avif',
      '/assets/works/riya-weds-tarun/grab-2.avif',
      '/assets/works/riya-weds-tarun/grab-3.avif',
    ],
    featured: true,
  },
  {
    slug: 'biki-debashrita-prewedding',
    title: 'Biki & Debashrita',
    client: 'Biki & Debashrita',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'Mandarmani Beach',
    location: 'West Bengal, India',
    runtimeSeconds: 45,
    aspect: '16:9',
    posterAvif: '/assets/works/biki-debashrita-prewedding/poster.avif',
    posterWebp: '/assets/works/biki-debashrita-prewedding/poster.webp',
    previewSources: {
      h264: '/assets/works/biki-debashrita-prewedding/preview.mp4',
    },
    videoSrc: '/assets/works/biki-debashrita-prewedding/full.mp4',
    captionsVtt: '/assets/works/biki-debashrita-prewedding/captions.vtt',
    transcript: [
      {
        time: '00:00',
        text: 'A high, wide shot of the beach in heavy morning fog. The surf line runs diagonally across wet sand, the sun a pale disc on the water. Handwritten title reads “Biki X Debashrita”. Only wind and distant surf are heard.',
      },
      {
        time: '00:03',
        text: 'Soft music enters over the ambience as the couple, seen from behind, walk toward the sea — he in a loose white shirt, she in a pale yellow dress.',
      },
      {
        time: '00:14',
        text: 'A dissolve layers two shots together: the couple holding one another beside bleached driftwood, the second image drifting across the frame. The music settles into a slow pulse.',
      },
      {
        time: '00:22',
        text: 'On the wet sand they face each other and join hands, then walk toward camera hand in hand, her dress lifting in the wind. Far-off figures are just visible in the haze. The music builds to full volume.',
      },
      {
        time: '00:34',
        text: 'A long dissolve carries the film off the beach into a green grove of screwpine and grass, the image resolving from soft focus.',
      },
      {
        time: '00:40',
        text: 'The couple stand among the greenery, foreheads almost touching, her eyes closed. The music fades out.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Location: 'Mandarmani Beach, West Bengal',
    },
    body: [
      'A pre-wedding film shot on an overcast beach morning, built around the fog and the tide rather than fighting them. The muted, almost monochrome palette of the sea became the grade’s starting point instead of a problem to correct.',
      'Cut to breathe — long holds on the horizon, minimal cutting on movement, letting the couple’s pace set the rhythm of the edit.',
    ],
    frameGrabs: [
      '/assets/works/biki-debashrita-prewedding/grab-1.avif',
      '/assets/works/biki-debashrita-prewedding/grab-2.avif',
      '/assets/works/biki-debashrita-prewedding/grab-3.avif',
    ],
    featured: true,
  },
  {
    slug: 'wedding-highlights-reel',
    title: 'Wedding Highlights Reel',
    client: 'Highlights Showcase',
    category: 'Wedding Highlights',
    year: 2025,
    venue: 'Wedding Venue',
    location: 'West Bengal, India',
    runtimeSeconds: 38,
    aspect: '16:9',
    posterAvif: '/assets/works/wedding-highlights-reel/poster.avif',
    posterWebp: '/assets/works/wedding-highlights-reel/poster.webp',
    previewSources: {
      h264: '/assets/works/wedding-highlights-reel/preview.mp4',
    },
    videoSrc: '/assets/works/wedding-highlights-reel/full.mp4',
    captionsVtt: '/assets/works/wedding-highlights-reel/captions.vtt',
    transcript: [
      {
        time: '00:00',
        text: 'Close on the bride at the reception: violet and gold banarasi, layered gold necklaces, mehendi on her hands, eyes lowered. Upbeat music with a strong beat runs from the first frame.',
      },
      {
        time: '00:07',
        text: 'She stands back from the camera in front of a pale pink arched backdrop set with candles and red-and-white flowers, adjusting her necklace.',
      },
      {
        time: '00:13',
        text: 'Night exterior of the decorated entrance — a canopy of red and white roses with hanging orange strands, red drapes and potted palms either side. The music builds.',
      },
      {
        time: '00:18',
        text: 'The music cuts to silence for a beat, then returns on the downbeat over a close portrait of the couple, foreheads together, her hand flat on the chest of his embroidered blue bandhgala.',
      },
      {
        time: '00:25',
        text: 'A posed two-shot in front of the backdrop, both looking straight to camera, his hand on her shoulder.',
      },
      {
        time: '00:31',
        text: 'They turn to each other and dance, hands raised and laughing, a lighting softbox visible at the edge of frame. The reel ends on the two of them back to back, arms folded, on the final beat.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Format: 'Wedding highlights cut',
    },
    body: [
      'A highlights-style cut demonstrating the pacing this studio defaults to for a same-week delivery: portrait beats, ceremony fragments, and reception energy compressed into well under a minute without feeling rushed.',
      'Built to work equally as a share-ready social cut and as the opening movement of a longer wedding film.',
    ],
    frameGrabs: [
      '/assets/works/wedding-highlights-reel/grab-1.avif',
      '/assets/works/wedding-highlights-reel/grab-2.avif',
      '/assets/works/wedding-highlights-reel/grab-3.avif',
    ],
    featured: true,
  },
  {
    slug: 'slog3-colour-grade',
    title: 'S-Log3 to Cinematic Grade',
    client: 'Colour Grading Showcase',
    category: 'Colour Grading',
    year: 2025,
    venue: 'Wedding Venue',
    location: 'West Bengal, India',
    runtimeSeconds: 39,
    aspect: '16:9',
    posterAvif: '/assets/works/slog3-colour-grade/poster.avif',
    posterWebp: '/assets/works/slog3-colour-grade/poster.webp',
    previewSources: {
      h264: '/assets/works/slog3-colour-grade/preview.mp4',
    },
    videoSrc: '/assets/works/slog3-colour-grade/full.mp4',
    captionsVtt: '/assets/works/slog3-colour-grade/captions.vtt',
    transcript: [
      {
        time: '00:00',
        text: 'A split-screen demonstration, captioned on screen “S-Log3 to Color Grading — The Cine Edit”. A moving divider separates the flat, milky S-Log3 original from the graded version of the same frame. Upbeat music plays throughout; there is no narration.',
      },
      {
        time: '00:07',
        text: 'The bride in violet and gold stands before the candlelit arched backdrop. Below the divider the ungraded side is grey and desaturated; above it the graded side carries warm skin tones and saturated reds in the decor.',
      },
      {
        time: '00:13',
        text: 'The comparison moves to the flower-covered entrance canopy. The ungraded half reads green and flat under the venue lighting while the graded half separates the reds of the roses from the foliage.',
      },
      {
        time: '00:18',
        text: 'The music cuts to silence for a beat and returns. A close two-shot of the couple shows the difference on skin: the raw side pale and low-contrast, the graded side warmer with the shadows held in the blue jacket.',
      },
      {
        time: '00:25',
        text: 'A posed portrait of the couple, the divider sweeping across so the same faces are seen ungraded and graded within one shot.',
      },
      {
        time: '00:31',
        text: 'The final comparison holds on the couple looking to camera, highlights rolled off in the graded half rather than clipped, before the piece ends on the last beat.',
      },
    ],
    credits: {
      Grade: 'DaVinci Resolve Studio',
      Source: 'Flat S-Log3 profile',
      Format: 'Vertical, social-first',
    },
    body: [
      'A side-by-side demonstration of the grading pass on flat S-Log3 footage: skin tones warmed and protected, shadows lifted just enough to hold detail in the fabric and jewellery, highlights rolled off rather than clipped.',
      'This is the exact colour pipeline every wedding delivery goes through before export, shown here on a single shot so the before-and-after is legible.',
    ],
    frameGrabs: [
      '/assets/works/slog3-colour-grade/grab-1.avif',
      '/assets/works/slog3-colour-grade/grab-2.avif',
      '/assets/works/slog3-colour-grade/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'wedding-teaser-reception',
    title: 'Gaye Holud & Ceremony Teaser',
    client: 'Private commission',
    category: 'Wedding Teaser',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 146,
    aspect: '16:9',
    posterAvif: '/assets/works/wedding-teaser-reception/poster.avif',
    posterWebp: '/assets/works/wedding-teaser-reception/poster.webp',
    previewSources: {
      h264: '/assets/works/wedding-teaser-reception/preview.mp4',
    },
    videoSrc: '/assets/works/wedding-teaser-reception/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A full-length wedding teaser cut from a two-day Bengali celebration, opening on the gaye holud and carrying through to the ceremony itself. The pacing sits deliberately slower than a reel — this is the version families watch together, so the beats are allowed to breathe.',
      'Graded warm to hold the yellows of the holud against the reds of the ceremony staging without letting either dominate the skin tones.',
    ],
    frameGrabs: [
      '/assets/works/wedding-teaser-reception/grab-1.avif',
      '/assets/works/wedding-teaser-reception/grab-2.avif',
      '/assets/works/wedding-teaser-reception/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'prewedding-reel-courtyard',
    title: 'Architectural Pre-Wedding Reel',
    client: 'Private commission',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 50,
    aspect: '16:9',
    posterAvif: '/assets/works/prewedding-reel-courtyard/poster.avif',
    posterWebp: '/assets/works/prewedding-reel-courtyard/poster.webp',
    previewSources: {
      h264: '/assets/works/prewedding-reel-courtyard/preview.mp4',
    },
    videoSrc: '/assets/works/prewedding-reel-courtyard/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A pre-wedding reel built on negative space: the couple kept small in wide architectural frames, with a dupatta sweeping the foreground to break the hard geometry of the location.',
      'The grade is cool and restrained here, leaning on the concrete and sky rather than warmth, so the fabric and skin carry all the colour in the frame.',
    ],
    frameGrabs: [
      '/assets/works/prewedding-reel-courtyard/grab-1.avif',
      '/assets/works/prewedding-reel-courtyard/grab-2.avif',
      '/assets/works/prewedding-reel-courtyard/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'prewedding-reel-golden-hour',
    title: 'Shoreline Pre-Wedding Reel',
    client: 'Private commission',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 39,
    aspect: '16:9',
    posterAvif: '/assets/works/prewedding-reel-golden-hour/poster.avif',
    posterWebp: '/assets/works/prewedding-reel-golden-hour/poster.webp',
    previewSources: {
      h264: '/assets/works/prewedding-reel-golden-hour/preview.mp4',
    },
    videoSrc: '/assets/works/prewedding-reel-golden-hour/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A short coastal pre-wedding reel cut to a single music bed, working almost entirely in wides and mid-shots against open sky and water.',
      'Graded for soft highlight rolloff so the overcast sky retains detail behind the couple instead of blowing out to white.',
    ],
    frameGrabs: [
      '/assets/works/prewedding-reel-golden-hour/grab-1.avif',
      '/assets/works/prewedding-reel-golden-hour/grab-2.avif',
      '/assets/works/prewedding-reel-golden-hour/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'colour-grade-seaside',
    title: 'Seaside Grade Demonstration',
    client: 'Grading showcase',
    category: 'Colour Grading',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 25,
    aspect: '16:9',
    posterAvif: '/assets/works/colour-grade-seaside/poster.avif',
    posterWebp: '/assets/works/colour-grade-seaside/poster.webp',
    previewSources: {
      h264: '/assets/works/colour-grade-seaside/preview.mp4',
    },
    videoSrc: '/assets/works/colour-grade-seaside/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A colour grading demonstration cut on coastal footage, carrying an on-screen grading credit. It shows how a flat capture is shaped toward a finished look without pushing skin tones into the sand and sea palette.',
      'Useful as a reference for how the studio treats high-dynamic-range daylight exteriors.',
    ],
    frameGrabs: [
      '/assets/works/colour-grade-seaside/grab-1.avif',
      '/assets/works/colour-grade-seaside/grab-2.avif',
      '/assets/works/colour-grade-seaside/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'prewedding-film-first-light',
    title: 'Pre-Wedding Film — Footbridge',
    client: 'Private commission',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 255,
    aspect: '16:9',
    posterAvif: '/assets/works/prewedding-film-first-light/poster.avif',
    posterWebp: '/assets/works/prewedding-film-first-light/poster.webp',
    previewSources: {
      h264: '/assets/works/prewedding-film-first-light/preview.mp4',
    },
    videoSrc: '/assets/works/prewedding-film-first-light/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A full-length pre-wedding film rather than a reel, running past four minutes. Built around symmetrical framing — the couple centred on a footbridge, walking toward and away from camera — with the edit holding shots long enough for the location to register.',
      'The longest piece in the collection, and the one that best shows the studio pacing an unhurried narrative rather than cutting to a beat.',
    ],
    frameGrabs: [
      '/assets/works/prewedding-film-first-light/grab-1.avif',
      '/assets/works/prewedding-film-first-light/grab-2.avif',
      '/assets/works/prewedding-film-first-light/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'prewedding-film-riverside',
    title: 'Pre-Wedding Film — Open Shore',
    client: 'Private commission',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 248,
    aspect: '16:9',
    posterAvif: '/assets/works/prewedding-film-riverside/poster.avif',
    posterWebp: '/assets/works/prewedding-film-riverside/poster.webp',
    previewSources: {
      h264: '/assets/works/prewedding-film-riverside/preview.mp4',
    },
    videoSrc: '/assets/works/prewedding-film-riverside/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A long-form pre-wedding film shot on an open shoreline under flat, overcast light. The cut uses the separation between the two figures as its main visual idea, bringing them together only in the final third.',
      'Graded to add contrast the original light did not provide, while keeping the muted palette the weather gave the shoot.',
    ],
    frameGrabs: [
      '/assets/works/prewedding-film-riverside/grab-1.avif',
      '/assets/works/prewedding-film-riverside/grab-2.avif',
      '/assets/works/prewedding-film-riverside/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'prewedding-film-terrace',
    title: 'Pre-Wedding Film — In Transit',
    client: 'Private commission',
    category: 'Pre-Wedding',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 217,
    aspect: '16:9',
    posterAvif: '/assets/works/prewedding-film-terrace/poster.avif',
    posterWebp: '/assets/works/prewedding-film-terrace/poster.webp',
    previewSources: {
      h264: '/assets/works/prewedding-film-terrace/preview.mp4',
    },
    videoSrc: '/assets/works/prewedding-film-terrace/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A long-form pre-wedding film that opens inside a car and moves outward, using the confined interior as a contrast to the exteriors that follow.',
      'Cut to hold small gestures — a hand on a gearstick, a rose on the dashboard — rather than relying on wide establishing coverage.',
    ],
    frameGrabs: [
      '/assets/works/prewedding-film-terrace/grab-1.avif',
      '/assets/works/prewedding-film-terrace/grab-2.avif',
      '/assets/works/prewedding-film-terrace/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'wedding-reel-ceremony',
    title: 'Mandap Ceremony Reel',
    client: 'Private commission',
    category: 'Wedding Highlights',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 39,
    aspect: '16:9',
    posterAvif: '/assets/works/wedding-reel-ceremony/poster.avif',
    posterWebp: '/assets/works/wedding-reel-ceremony/poster.webp',
    previewSources: {
      h264: '/assets/works/wedding-reel-ceremony/preview.mp4',
    },
    videoSrc: '/assets/works/wedding-reel-ceremony/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A wedding highlights reel centred on the mandap: the couple framed under floral drapes in cream and pink, with the ceremony staging kept symmetrical behind them.',
      'Shot at 50fps and conformed for controlled slow motion on the ritual beats without the motion reading as artificial.',
    ],
    frameGrabs: [
      '/assets/works/wedding-reel-ceremony/grab-1.avif',
      '/assets/works/wedding-reel-ceremony/grab-2.avif',
      '/assets/works/wedding-reel-ceremony/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'wedding-reel-sangeet',
    title: 'Reception Stage Reel',
    client: 'Private commission',
    category: 'Wedding Highlights',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 37,
    aspect: '16:9',
    posterAvif: '/assets/works/wedding-reel-sangeet/poster.avif',
    posterWebp: '/assets/works/wedding-reel-sangeet/poster.webp',
    previewSources: {
      h264: '/assets/works/wedding-reel-sangeet/preview.mp4',
    },
    videoSrc: '/assets/works/wedding-reel-sangeet/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A short reception reel cut against a saturated stage backdrop of decorative fans in teal, gold and rose. The grade had to hold those competing colours without letting them contaminate the couple.',
      'A useful example of protecting skin tones inside heavily coloured event lighting.',
    ],
    frameGrabs: [
      '/assets/works/wedding-reel-sangeet/grab-1.avif',
      '/assets/works/wedding-reel-sangeet/grab-2.avif',
      '/assets/works/wedding-reel-sangeet/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'wedding-reel-reception',
    title: 'Bridal Portrait Reel',
    client: 'Private commission',
    category: 'Wedding Highlights',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 41,
    aspect: '16:9',
    posterAvif: '/assets/works/wedding-reel-reception/poster.avif',
    posterWebp: '/assets/works/wedding-reel-reception/poster.webp',
    previewSources: {
      h264: '/assets/works/wedding-reel-reception/preview.mp4',
    },
    videoSrc: '/assets/works/wedding-reel-reception/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A bridal portrait reel shot between floral pillars on a red carpet runner, cut tight and kept simple so the styling and the staging carry the piece.',
      'The same shoot also exists as a colour grading breakdown, which shows the ungraded capture alongside this finished version.',
    ],
    frameGrabs: [
      '/assets/works/wedding-reel-reception/grab-1.avif',
      '/assets/works/wedding-reel-reception/grab-2.avif',
      '/assets/works/wedding-reel-reception/grab-3.avif',
    ],
    featured: false,
  },
  {
    slug: 'colour-grade-comparison',
    title: 'Grade Breakdown — Bridal Portrait',
    client: 'Grading showcase',
    category: 'Colour Grading',
    year: 2025,
    venue: 'On location',
    location: 'West Bengal, India',
    runtimeSeconds: 41,
    aspect: '16:9',
    posterAvif: '/assets/works/colour-grade-comparison/poster.avif',
    posterWebp: '/assets/works/colour-grade-comparison/poster.webp',
    previewSources: {
      h264: '/assets/works/colour-grade-comparison/preview.mp4',
    },
    videoSrc: '/assets/works/colour-grade-comparison/full.mp4',
    transcript: [
      {
        time: '00:00',
        text: 'This film has no spoken dialogue. The soundtrack is a licensed music bed with natural location ambience underneath.',
      },
    ],
    credits: {
      Edit: 'Manas Bera / The Cine Edit',
      Grade: 'DaVinci Resolve Studio',
      Sound: 'Licensed score',
    },
    body: [
      'A grading breakdown built from the bridal portrait shoot, showing the footage moving from flat capture to finished look within single shots.',
      'Cut specifically as a technical demonstration rather than a client deliverable — the point is the transition, not the coverage.',
    ],
    frameGrabs: [
      '/assets/works/colour-grade-comparison/grab-1.avif',
      '/assets/works/colour-grade-comparison/grab-2.avif',
      '/assets/works/colour-grade-comparison/grab-3.avif',
    ],
    featured: false,
  },
];

export const works = worksData.map((work) => WorkSchema.parse(work));
