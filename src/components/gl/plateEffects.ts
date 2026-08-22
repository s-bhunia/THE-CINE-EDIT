/**
 * Look controls for the hero plate. Everything here is scoped to the entry
 * video by construction: FilmPlate, GlCanvas and CssFallbackGrain are only ever
 * rendered by HeroPlate, so nothing else on the site carries these effects.
 *
 * Both are off, so the intro film plays clean and full-bleed. Nothing is
 * deleted — flip either back to true and the look returns in both the WebGL
 * plate and the CSS fallback, which each implement their own half.
 */

/**
 * The vignette that shades the frame border, the barrel distortion that bows
 * it, and the chromatic aberration that fringes it — the projector-gate look.
 */
export const PLATE_EDGE_TREATMENT = false;

/** Film grain scattered over the plate. */
export const PLATE_GRAIN = false;

/** Shader-friendly forms of the flags. */
export const PLATE_EDGE_STRENGTH = PLATE_EDGE_TREATMENT ? 1 : 0;
export const PLATE_GRAIN_STRENGTH = PLATE_GRAIN ? 1 : 0;
