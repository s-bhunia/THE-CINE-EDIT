/**
 * Cache-buster for the hero plate's media.
 *
 * These filenames never change, so a re-encode is invisible to anyone who has
 * already loaded the site: vercel.json serves /assets/** with a year-long
 * immutable max-age, so the browser just keeps the old bytes. This token is
 * what actually reaches those visitors.
 *
 * Bump on every hero re-encode, and keep it in step with the poster preload in
 * index.html, which has to request the exact same URL or the preload is wasted.
 */
export const HERO_MEDIA_VERSION = '3';

const query = `?v=${HERO_MEDIA_VERSION}`;

export const heroMedia = {
  loop1080: `/assets/hero/loop-1080p.mp4${query}`,
  loop720: `/assets/hero/loop-720p.mp4${query}`,
  poster: `/assets/hero/poster.avif${query}`,
};
