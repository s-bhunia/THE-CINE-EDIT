import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/work',
  '/work/riya-weds-tarun',
  '/work/biki-debashrita-prewedding',
  '/work/wedding-highlights-reel',
  '/work/slog3-colour-grade',
  '/stills',
  '/experience',
  '/about',
  '/contact',
];

for (const route of routes) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(
      seriousOrCritical,
      seriousOrCritical.map((v) => `${v.id}: ${v.description}`).join('\n'),
    ).toEqual([]);
  });
}
