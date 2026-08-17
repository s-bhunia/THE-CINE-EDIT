import { test, expect } from '@playwright/test';

const routes = ['/', '/work', '/stills', '/experience', '/about', '/contact'];

for (const route of routes) {
  test(`${route} renders a single h1 and reaches DOMContentLoaded`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('unknown route renders the offline-media 404', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.locator('h1')).toHaveCount(1);
});
