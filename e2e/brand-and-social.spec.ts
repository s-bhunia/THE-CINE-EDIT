import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };

const WHATSAPP_URL = /wa\.me/;
const INSTAGRAM_URL = /instagram\.com\/the_cine_edit/;

test.describe('hero plate', () => {
  test.use({ viewport: DESKTOP });

  test('fills the viewport edge to edge', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const hero = page.locator('[data-hero-plate]');
    await expect(hero).toBeAttached({ timeout: 20000 });

    const box = await hero.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        clientWidth: document.documentElement.clientWidth,
        viewportHeight: window.innerHeight,
      };
    });

    expect(box.top).toBe(0);
    expect(box.left).toBe(0);
    expect(box.width).toBe(box.clientWidth);
    expect(box.height).toBe(box.viewportHeight);
  });

  test('sets the wordmark in the mono face with wide tracking', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.locator('[data-hero-plate] h1');
    await expect(heading).toBeAttached({ timeout: 20000 });

    const type = await heading.evaluate((el) => {
      const style = getComputedStyle(el);
      return { family: style.fontFamily, tracking: style.letterSpacing };
    });

    expect(type.family).toContain('Geist Mono');
    expect(Number.parseFloat(type.tracking)).toBeGreaterThan(0);
  });

  test('serves the 1080p encode on a wide viewport and plays it', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const video = page.locator('[data-hero-plate] video');
    await expect(video).toBeAttached({ timeout: 20000 });

    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentSrc), {
        timeout: 20000,
      })
      .toContain('loop-1080p.mp4');

    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentTime), {
        timeout: 20000,
      })
      .toBeGreaterThan(0.1);
  });
});

test.describe('whatsapp floating button', () => {
  test.use({ viewport: DESKTOP });

  test('sits in the bottom-right corner clear of the audio toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const fab = page.getByRole('link', { name: /message the cine edit on whatsapp/i });
    await expect(fab).toBeVisible({ timeout: 20000 });
    await expect(fab).toHaveAttribute('href', WHATSAPP_URL);

    const overlap = await page.evaluate(() => {
      const button = document.querySelector('a[aria-label*="on WhatsApp"]');
      const toggle = document.querySelector('button[aria-label*="interface sound"]');
      if (!button || !toggle) return null;
      const a = button.getBoundingClientRect();
      const b = toggle.getBoundingClientRect();
      return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    });
    expect(overlap, 'button and audio toggle must not overlap').toBe(false);
  });

  test('stands down on the about page, which carries its own row', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
      timeout: 20000,
    });

    await expect(
      page.getByRole('link', { name: /message the cine edit on whatsapp/i }),
    ).toHaveCount(0);
  });
});

for (const [name, viewport] of [
  ['desktop', DESKTOP],
  ['phone', PHONE],
] as const) {
  test(`about page offers whatsapp and instagram on ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // The phone layout reaches About through the single page; desktop has a route.
    await page.goto(name === 'phone' ? '/' : '/about');
    await page.waitForLoadState('domcontentloaded');

    const about = page.locator('#about');
    if (name === 'phone') {
      await expect(about).toBeAttached({ timeout: 25000 });
      await about.scrollIntoViewIfNeeded();
    }

    const whatsapp = page.getByRole('link', { name: /message on whatsapp/i }).first();
    const instagram = page.getByRole('link', { name: /on instagram/i }).first();

    await expect(whatsapp).toBeVisible({ timeout: 20000 });
    await expect(whatsapp).toHaveAttribute('href', WHATSAPP_URL);
    await expect(instagram).toBeVisible();
    await expect(instagram).toHaveAttribute('href', INSTAGRAM_URL);
  });
}

test('brand marks are served and the ink is the browner ground', async ({ page }) => {
  const missing: string[] = [];
  page.on('response', (response) => {
    if (
      response.status() >= 400 &&
      /favicon|apple-touch-icon|assets\/brand/.test(response.url())
    ) {
      missing.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const mark = page.locator('header img[src*="assets/brand/mark"]');
  await expect(mark).toBeAttached({ timeout: 20000 });
  await expect
    .poll(() => mark.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
      timeout: 20000,
    })
    .toBeGreaterThan(0);

  const icons = await page.evaluate(async () => {
    const load = (src: string) =>
      new Promise<number>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image.naturalWidth);
        image.onerror = () => resolve(-1);
        image.src = src;
      });
    return {
      favicon32: await load('/favicon-32.png'),
      favicon192: await load('/favicon-192.png'),
      appleTouch: await load('/apple-touch-icon.png'),
    };
  });
  expect(icons.favicon32).toBe(32);
  expect(icons.favicon192).toBe(192);
  expect(icons.appleTouch).toBe(180);
  expect(missing).toEqual([]);

  const ink = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim(),
  );
  expect(ink).toBe('#140e0a');
});
