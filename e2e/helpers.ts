import type { Page } from '@playwright/test';

/**
 * Navigate and wait for the boot splash to hand over.
 *
 * AppLoader is a full-screen overlay until the page's critical assets — the
 * hero clip and its poster on `/` — have loaded, so it swallows any click a
 * test fires before then. Prefer this to `networkidle`, which on `/` has to
 * wait out the whole hero clip buffering.
 */
export async function gotoStaged(page: Page, path = '/') {
  await page.goto(path);
  await page.locator('[data-app-loader]').waitFor({ state: 'detached', timeout: 20000 });
}

/**
 * Scroll to a viewport multiple and wait for Lenis to stop easing, since it
 * eases toward a target rather than jumping to it.
 */
export async function settleAt(page: Page, viewports: number) {
  await page.evaluate((v) => window.scrollTo(0, window.innerHeight * v), viewports);
  let last = -1;
  for (let i = 0; i < 50; i += 1) {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === last) return y;
    last = y;
    await page.waitForTimeout(80);
  }
  return last;
}
