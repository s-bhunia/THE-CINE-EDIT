import { test, expect } from '@playwright/test';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

/** Anchors the phone layout stitches onto the home page. */
const SECTIONS = ['#work', '#stills', '#packages', '#experience', '#words', '#about'];

test.describe('phone single page', () => {
  test.use({ viewport: PHONE });

  test('stitches every section onto the home page behind one h1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toHaveCount(1);
    for (const section of SECTIONS) {
      await expect(page.locator(section), `${section} present`).toBeAttached({
        timeout: 15000,
      });
    }
  });

  test('numbers its slates in page order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#about')).toBeAttached({ timeout: 15000 });

    const numbers = await page.evaluate(() =>
      Array.from(document.querySelectorAll('span'))
        .map((node) => node.textContent?.trim() ?? '')
        .map((text) => /^SEQ (\d+)/.exec(text)?.[1])
        .filter((match): match is string => Boolean(match))
        .map(Number),
    );

    expect(numbers.length).toBeGreaterThan(4);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  test('holds the enquiry form back until it is scrolled to', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('#contact')).toHaveCount(0);

    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact')).toBeAttached({ timeout: 20000 });
  });

  test('scrolls within the page from the menu instead of navigating away', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#stills')).toBeAttached({ timeout: 15000 });

    await page.evaluate(() => {
      (window as unknown as { __stayed: boolean }).__stayed = true;
    });

    await page.getByRole('button', { name: /menu/i }).click();
    await page
      .getByRole('navigation')
      .getByRole('link', { name: /stills/i })
      .click();

    await expect
      .poll(
        () => page.locator('#stills').evaluate((el) => el.getBoundingClientRect().top),
        { timeout: 15000 },
      )
      .toBeLessThan(180);

    expect(
      await page.evaluate(
        () => (window as unknown as { __stayed?: boolean }).__stayed === true,
      ),
      'no document reload',
    ).toBe(true);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('regrades the whole page from a single look tap', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const golden = page.getByRole('button', { name: 'Golden' });
    await expect(golden).toBeVisible({ timeout: 15000 });

    const before = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bone').trim(),
    );

    await golden.click();
    await expect(golden).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.grade))
      .toBe('active');

    const after = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bone').trim(),
    );
    expect(after).not.toBe(before);

    // The media filter is defined outside the desktop-only aside, so it stays
    // reachable on a phone where that aside is display:none.
    expect(
      await page.evaluate(() => Boolean(document.getElementById('grade-media-filter'))),
    ).toBe(true);

    await page.getByRole('button', { name: 'Neutral' }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.grade))
      .toBeUndefined();
  });

  test('reports position as a swipe rail advances', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const rail = page.locator('#work [role="group"][aria-label="Selects"]');
    await expect(rail).toBeAttached({ timeout: 15000 });
    await rail.scrollIntoViewIfNeeded();

    const counter = page
      .locator('#work')
      .getByText(/\d\d \/ \d\d/)
      .first();
    await expect(counter).toContainText('01 /');

    await rail.evaluate((el) => el.scrollBy({ left: el.clientWidth * 3 }));
    await expect
      .poll(() => counter.textContent(), { timeout: 15000 })
      .not.toContain('01 /');
  });

  test('no horizontal overflow down the whole page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#about')).toBeAttached({ timeout: 15000 });

    for (const step of [0, 1, 2, 3, 4, 5, 6, 7]) {
      await page.evaluate((index) => window.scrollTo(0, index * 800), step);
      await page.waitForTimeout(200);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${step * 800}px`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('full-screen overlays own the viewport', () => {
  test.use({ viewport: PHONE });

  test('the lightbox takes the header out of the way and freezes the page', async ({
    page,
  }) => {
    await page.goto('/stills');
    await page.waitForLoadState('domcontentloaded');

    await page
      .locator('button')
      .filter({ has: page.locator('img') })
      .first()
      .click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('[data-site-header]')).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe(
      'hidden',
    );

    await page.getByRole('button', { name: /close lightbox/i }).click();
    await expect(page.locator('[data-site-header]')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe(
      'hidden',
    );
  });
});

test.describe('desktop composition is untouched', () => {
  test.use({ viewport: DESKTOP });

  test('renders the original sections and the wheels, not the phone layout', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    for (const section of SECTIONS) {
      await expect(page.locator(section), `${section} absent`).toHaveCount(0);
    }

    await expect(page.getByText('SIGNATURE SELECTS', { exact: false })).toBeVisible();
    await expect(page.getByText('SEQ 02 — PROCESS', { exact: false })).toBeVisible();
    await expect(
      page.getByText('SEQ 03 — WHAT WE COVER', { exact: false }),
    ).toBeVisible();
    await expect(page.getByText('SEQ 04 — WORDS', { exact: false })).toBeVisible();

    await expect(page.locator('aside[aria-label="Primary colour grade"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Golden' })).toBeHidden();
  });

  test('the menu still navigates to the standalone routes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page
      .getByRole('navigation')
      .getByRole('link', { name: /stills/i })
      .click();
    await expect(page).toHaveURL(/\/stills$/);
  });
});

test('whatsapp is brand green in the footer and white on the floating button', async ({
  page,
}) => {
  for (const route of ['/', '/contact']) {
    await page.goto(route);
    await page.waitForLoadState('domcontentloaded');

    // domcontentloaded fires before React has rendered, so give the footer time.
    const footerGlyph = page.locator('footer a[href*="wa.me"] svg').first();
    await expect(footerGlyph).toBeAttached({ timeout: 20000 });
    // The glyph paints with currentColor, so assert the resolved colour rather
    // than the attribute — that is what a visitor actually sees.
    expect(
      await footerGlyph.evaluate((el) => getComputedStyle(el).fill),
      `footer glyph on ${route}`,
    ).toBe('rgb(37, 211, 102)');
  }

  // The floating button inverts it: white mark on a green disc.
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  const fab = page.locator('a[aria-label*="on WhatsApp"]');
  await expect(fab).toBeVisible({ timeout: 20000 });
  const fabPaint = await fab.evaluate((el) => {
    const svg = el.querySelector('svg');
    return {
      disc: getComputedStyle(el).backgroundColor,
      glyph: svg ? getComputedStyle(svg).fill : null,
    };
  });
  expect(fabPaint.disc).toBe('rgb(37, 211, 102)');
  expect(fabPaint.glyph).toBe('rgb(255, 255, 255)');
});

test.describe('scroll-in reveals', () => {
  test.use({ viewport: PHONE });

  test('sections start hidden and rise in as they arrive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Watch a section far enough down that it cannot already have been observed,
    // so the pre-reveal state is not a race against the first paint.
    await expect(page.locator('#about')).toBeAttached({ timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, 0));

    const head = page.locator('#about .rise').first();
    await expect(head).toHaveAttribute('data-in', 'false');
    expect(await head.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(head).toHaveAttribute('data-in', 'true', { timeout: 15000 });
    await expect
      .poll(() => head.evaluate((el) => getComputedStyle(el).opacity), {
        timeout: 15000,
      })
      .toBe('1');
  });

  test('the numbers count up from 1 to their totals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const numbers = page.locator('section[aria-label="By the numbers"]');
    await expect(numbers).toBeAttached({ timeout: 20000 });

    const digits = numbers.locator('[aria-hidden="true"]');
    await expect(digits.first()).toHaveText('1+');

    await numbers.scrollIntoViewIfNeeded();

    await expect
      .poll(() => digits.first().textContent(), { timeout: 15000 })
      .toBe('3000+');
    await expect.poll(() => digits.nth(1).textContent(), { timeout: 15000 }).toBe('100+');
  });

  test('the process beats are stacked and gate open in sequence', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('#process')).toBeAttached({ timeout: 20000 });

    // Stacked now, so there is no swipe rail in this section.
    await expect(page.locator('#process [role="group"]')).toHaveCount(0);

    const gates = page.locator('#process .gate');
    await expect(gates).toHaveCount(3);

    const delays = await gates.evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).transitionDelay),
    );
    expect(new Set(delays).size, 'each beat waits its turn').toBe(3);

    await page.locator('#process').scrollIntoViewIfNeeded();
    await expect(gates.last()).toHaveAttribute('data-in', 'true', { timeout: 15000 });
    await expect
      .poll(() => gates.last().evaluate((el) => getComputedStyle(el).clipPath), {
        timeout: 15000,
      })
      .toMatch(/inset\(0(px)?\)|none/);
  });

  test('every kind of day lands one item at a time', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('#packages')).toBeAttached({ timeout: 20000 });

    const items = page.locator('#packages .rise');
    await page.locator('#packages').scrollIntoViewIfNeeded();
    await expect(items.first()).toHaveAttribute('data-in', 'true', { timeout: 15000 });

    const delays = await items.evaluateAll((nodes) =>
      nodes.map((node) => Number.parseFloat(getComputedStyle(node).transitionDelay)),
    );
    expect(delays.length).toBeGreaterThan(8);
    // Strictly increasing: chips first, then the craft list continues the run.
    for (let index = 1; index < delays.length; index += 1) {
      expect(delays[index]!).toBeGreaterThanOrEqual(delays[index - 1]!);
    }
    expect(delays.at(-1)!).toBeGreaterThan(delays[0]!);
  });

  test('reduced motion shows everything at once with no transitions', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: PHONE,
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const head = page.locator('#work .rise').first();
    await expect(head).toHaveAttribute('data-in', 'true');
    expect(await head.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');

    const digits = page
      .locator('section[aria-label="By the numbers"] [aria-hidden="true"]')
      .first();
    await expect(digits).toHaveText('3000+');

    await context.close();
  });
});
