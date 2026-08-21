import { test, expect, type Page } from '@playwright/test';

const routes = ['/', '/work', '/stills', '/experience', '/about', '/contact'];
const viewports = [
  { label: 'phone', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'tablet-landscape', width: 1024, height: 768 },
  { label: 'desktop', width: 1280, height: 800 },
];

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders: string[] = [];
    for (const node of Array.from(document.body.querySelectorAll('*'))) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0) continue;
      if (rect.right > doc.clientWidth + 1) {
        offenders.push(
          `${node.tagName.toLowerCase()}.${node.className.toString().slice(0, 60)}`,
        );
      }
    }
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders: offenders.slice(0, 5),
    };
  });
}

test.use({ viewport: { width: 1280, height: 800 } });

for (const viewport of viewports) {
  for (const route of routes) {
    test(`${route} has no horizontal overflow at ${viewport.label} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      await expect
        .poll(async () => (await horizontalOverflow(page)).scrollWidth, { timeout: 5000 })
        .toBeLessThanOrEqual((await horizontalOverflow(page)).clientWidth + 1);

      const result = await horizontalOverflow(page);
      expect(
        result.scrollWidth,
        `overflowing elements: ${result.offenders.join(', ')}`,
      ).toBeLessThanOrEqual(result.clientWidth + 1);
    });
  }
}

test('primary navigation is reachable at every breakpoint', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page
      .locator('header nav a, header button')
      .first()
      .waitFor({ state: 'attached', timeout: 20000 });

    const directLink = page
      .getByRole('navigation')
      .getByRole('link', { name: /selects/i });
    if (await directLink.first().isVisible()) continue;

    const menuToggle = page.getByRole('button', { name: /menu/i });
    await expect(
      menuToggle,
      `no visible nav link and no menu button at ${viewport.width}px`,
    ).toBeVisible();
    await menuToggle.click();
    await expect(directLink.first()).toBeVisible();
  }
});
