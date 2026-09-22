import { test, expect } from '@playwright/test';
import { gotoStaged, settleAt } from './helpers';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

/** What is actually staged at the centre of the screen right now. */
const centreOf = () => {
  const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  return el?.closest('.curtain') ? 'curtain' : el?.closest('.scene') ? 'scene' : 'other';
};

test.describe('the staged home page', () => {
  test('runs four acts, alternating scene and curtain the whole way down', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await gotoStaged(page);

    await expect(page.locator('.act')).toHaveCount(4);
    expect(await page.evaluate(centreOf)).toBe('scene');

    const tall = await page.evaluate(
      () => document.documentElement.scrollHeight / window.innerHeight,
    );
    expect(tall, 'four overlapping acts make a long page').toBeGreaterThan(8);

    let scenes = 0;
    let curtains = 0;
    for (let v = 0.5; v <= tall - 1; v += 0.5) {
      await settleAt(page, v);
      const centre = await page.evaluate(centreOf);
      expect(centre, `something is staged at ${v}vh`).not.toBe('other');
      if (centre === 'scene') scenes += 1;
      else curtains += 1;
    }

    // The scenes are the work. If the curtains hold the centre the whole way
    // down then the scene holds are too short and the films never get seen.
    expect(scenes, 'scenes get real screen time').toBeGreaterThan(5);
    expect(curtains, 'curtains get real screen time').toBeGreaterThan(5);
  });

  test('curtain text rises in and plays back out on the way up', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await gotoStaged(page);

    const rise = page.locator('.curtain .rise').first();
    await expect(rise).toHaveAttribute('data-in', 'false');

    await settleAt(page, 1.6);
    await expect(rise).toHaveAttribute('data-in', 'true');
    await expect(page.getByRole('heading', { name: /why the cine edit/i })).toBeVisible();

    await settleAt(page, 0);
    await expect(rise).toHaveAttribute('data-in', 'false');
  });

  test('the counters run up, and run again when scrolled back to', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await gotoStaged(page);

    const digits = page.locator('.curtain [aria-hidden="true"]').filter({ hasText: '+' });

    await settleAt(page, 1.6);
    await expect.poll(() => digits.first().textContent()).toBe('3000+');
    await expect.poll(() => digits.nth(1).textContent()).toBe('1000+');

    await settleAt(page, 0);
    await expect.poll(() => digits.first().textContent()).toBe('1+');
  });

  test('each scene offers one labelled way through to its full page', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await gotoStaged(page);

    await settleAt(page, 2.5);
    await expect(page.getByRole('link', { name: /see all work/i })).toBeVisible();

    await settleAt(page, 5.5);
    await expect(page.getByRole('link', { name: /see all stills/i })).toBeVisible();
  });

  for (const [name, viewport] of [
    ['desktop', DESKTOP],
    ['phone', PHONE],
  ] as const) {
    test(`never scrolls sideways on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoStaged(page);

      const tall = await page.evaluate(
        () => document.documentElement.scrollHeight / window.innerHeight,
      );

      for (let v = 0; v <= tall - 1; v += 1) {
        await settleAt(page, v);
        const overflows = await page.evaluate(
          () =>
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflows, `no sideways scroll at ${v}vh`).toBe(false);
      }
    });
  }

  test('reduced motion collapses the staging and still shows the hero', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: PHONE,
    });
    const page = await context.newPage();
    await gotoStaged(page);

    // Nothing pins, and every reveal is already open.
    const positions = await page
      .locator('.pin')
      .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).position));
    expect(new Set(positions)).toEqual(new Set(['static']));

    await expect(page.locator('.rise').first()).toHaveAttribute('data-in', 'true');

    // The hero must keep its height: a percentage height against an auto-height
    // parent resolves to nothing, which would collapse the plate entirely.
    const heroHeight = await page
      .locator('[data-hero-plate]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(heroHeight).toBeGreaterThan(400);

    await context.close();
  });
});
