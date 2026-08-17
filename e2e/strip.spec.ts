import { test, expect } from '@playwright/test';

const STRIP =
  'section:has(> div > span:text-matches("SIGNATURE SELECTS")) div.overflow-x-auto';

test.use({ viewport: { width: 1280, height: 800 } });

test('signature selects strip can be dragged horizontally with a mouse', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const strip = page.locator(STRIP).first();
  await expect(strip).toBeVisible();

  const overflows = await strip.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(overflows).toBe(true);

  await strip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await strip.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const startX = box.x + box.width - 80;
  const y = box.y + box.height / 2;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  for (let step = 1; step <= 6; step += 1) {
    await page.mouse.move(startX - step * 60, y);
  }
  await page.mouse.up();

  await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
});

test('dragging the strip does not follow the tile link', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const strip = page.locator(STRIP).first();
  await strip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await strip.boundingBox();
  if (!box) return;

  const startX = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  for (let step = 1; step <= 5; step += 1) {
    await page.mouse.move(startX - step * 50, y);
  }
  await page.mouse.up();

  await page.waitForTimeout(300);
  expect(new URL(page.url()).pathname).toBe('/');
});
