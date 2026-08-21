import { test, expect, type Page } from '@playwright/test';

const PANEL = 'aside[aria-label="Primary colour grade"]';

test.use({ viewport: { width: 1280, height: 800 } });

function rootState(page: Page) {
  return page.evaluate(() => ({
    grade: document.documentElement.getAttribute('data-grade'),
    ink: document.documentElement.style.getPropertyValue('--color-ink'),
    bone: document.documentElement.style.getPropertyValue('--color-bone'),
    ring: document.documentElement.style.getPropertyValue('--grade-ring-angle'),
  }));
}

async function dragWheel(page: Page, label: string, dx: number, dy: number) {
  const disc = page.locator(`${PANEL} [aria-label="${label} colour balance"]`);
  const box = await disc.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 5 });
  await page.mouse.up();
}

test('grade wheels appear on the reel page only', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator(PANEL)).toBeVisible();

  await page.goto('/work');
  await page.waitForLoadState('networkidle');
  await expect(page.locator(PANEL)).toHaveCount(0);
});

test('dragging a wheel regrades the palette and reset restores it', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const before = await rootState(page);
  expect(before.grade).toBeNull();
  expect(before.ink).toBe('');

  await dragWheel(page, 'Gain', 0, -14);

  const graded = await rootState(page);
  expect(graded.grade).toBe('active');
  expect(graded.ink).toMatch(/^#[0-9a-f]{6}$/);
  expect(graded.bone).toMatch(/^#[0-9a-f]{6}$/);
  expect(graded.bone).not.toBe(before.bone);

  await page.locator(`${PANEL} button:text-matches("reset", "i")`).click();

  const after = await rootState(page);
  expect(after.grade).toBeNull();
  expect(after.ink).toBe('');
});

test('grading applies an SVG filter to page media', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const filterBefore = await page.evaluate(() => {
    const img = document.querySelector('main img');
    return img ? getComputedStyle(img).filter : null;
  });
  expect(filterBefore).toBe('none');

  await dragWheel(page, 'Lift', 0, -14);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const img = document.querySelector('main img');
        return img ? getComputedStyle(img).filter : null;
      }),
    )
    .toContain('grade-media-filter');
});

test('the wheel housing rotates as the page scrolls', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const atTop = (await rootState(page)).ring;

  await page.locator('section').last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  await expect.poll(async () => (await rootState(page)).ring).not.toBe(atTop);
});

test('wheels are keyboard operable and reachable', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const slider = page.locator(`${PANEL} input[type="range"]`).first();
  await slider.focus();
  await expect(slider).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');

  const graded = await rootState(page);
  expect(graded.grade).toBe('active');
});
