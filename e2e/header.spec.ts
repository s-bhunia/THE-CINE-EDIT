import { test, expect } from '@playwright/test';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

async function headerBackground(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const header = document.querySelector('header');
    return header ? getComputedStyle(header).backgroundColor : null;
  });
}

test('header is transparent over the hero and gains a solid scrim once scrolled', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(await headerBackground(page)).toBe(TRANSPARENT);

  await page.locator('section').last().scrollIntoViewIfNeeded();
  await expect
    .poll(() => headerBackground(page), { timeout: 5000 })
    .not.toBe(TRANSPARENT);
});

test('header never uses mix-blend-difference against page content', async ({ page }) => {
  await page.goto('/work');
  await page.waitForLoadState('networkidle');

  const blend = await page.evaluate(() => {
    const header = document.querySelector('header');
    return header ? getComputedStyle(header).mixBlendMode : null;
  });

  expect(blend).toBe('normal');
});
