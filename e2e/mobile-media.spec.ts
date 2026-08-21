import { test, expect, type Page } from '@playwright/test';

async function forceCores(page: Page, cores: number) {
  await page.addInitScript((count) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => count });
  }, cores);
}

function heroState(page: Page) {
  return page.evaluate(() => {
    const video = document.querySelector('main video');
    if (!(video instanceof HTMLVideoElement)) return null;
    return {
      src: video.currentSrc,
      paused: video.paused,
      errorCode: video.error?.code ?? null,
    };
  });
}

test('hero loop still renders on a low-core phone', async ({ page }) => {
  await forceCores(page, 4);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect.poll(() => heroState(page), { timeout: 10000 }).not.toBeNull();

  const hero = await heroState(page);
  expect(hero?.errorCode).toBeNull();
  expect(hero?.src).toContain('/assets/hero/');
});

test('hero loop serves the narrow encode on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect.poll(() => heroState(page), { timeout: 10000 }).not.toBeNull();
  const hero = await heroState(page);
  expect(hero?.src).toContain('loop-720p.mp4');
});

test('hero falls back to the poster with reduced motion and never errors', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(await heroState(page)).toBeNull();
  await expect(page.locator('main img').first()).toBeVisible();
});

test('a case study video is present and loadable on mobile', async ({ page }) => {
  await forceCores(page, 4);
  await page.goto('/work/wedding-reel-sangeet');
  await page.waitForLoadState('networkidle');

  const video = page.locator('video').first();
  await expect(video).toBeVisible();

  const state = await video.evaluate(async (node) => {
    const media = node as HTMLVideoElement;
    const source = media.currentSrc || media.querySelector('source')?.getAttribute('src');

    media.preload = 'metadata';
    media.load();
    await new Promise((resolve) => {
      media.addEventListener('loadedmetadata', resolve, { once: true });
      media.addEventListener('error', resolve, { once: true });
      window.setTimeout(resolve, 8000);
    });

    return {
      source,
      readyState: media.readyState,
      duration: media.duration,
      errorCode: media.error?.code ?? null,
    };
  });

  expect(state.source).toContain('/assets/works/');
  expect(state.errorCode).toBeNull();
  expect(state.readyState).toBeGreaterThan(0);
  expect(state.duration).toBeGreaterThan(1);
});
