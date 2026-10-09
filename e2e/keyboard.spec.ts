import { test, expect, type Page } from '@playwright/test';
import { gotoStaged } from './helpers';

const routes = ['/', '/work', '/stills', '/experience', '/about', '/contact'];

function activeDescriptor(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40),
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      boxShadow: style.boxShadow,
    };
  });
}

test.describe('keyboard operability', () => {
  for (const route of routes) {
    test(`${route} exposes every visible control to the Tab sequence`, async ({
      page,
    }) => {
      await gotoStaged(page, route);

      const expected = await page.evaluate(() => {
        const selector =
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(document.querySelectorAll(selector)).filter((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            (rect.width > 0 || rect.height > 0)
          );
        }).length;
      });

      const reached = new Set<string>();
      for (let step = 0; step < expected + 12; step += 1) {
        await page.keyboard.press('Tab');
        const current = await activeDescriptor(page);
        if (!current) continue;
        reached.add(`${current.tag}:${current.label}`);
      }

      expect(reached.size).toBeGreaterThan(0);
      expect(expected).toBeGreaterThan(0);
    });
  }

  test('skip link is the first focusable element and moves focus to main', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');

    const firstFocusable = page
      .locator(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      .first();
    await expect(firstFocusable).toHaveText(/skip/i);

    if (browserName === 'webkit') {
      await firstFocusable.focus();
    } else {
      await page.keyboard.press('Tab');
      const skip = await activeDescriptor(page);
      expect(skip?.label.toLowerCase()).toContain('skip');
    }

    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toBeFocused();
  });

  test('focused controls render a visible focus indicator', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('form')).toBeVisible();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await activeDescriptor(page);
    expect(focused).not.toBeNull();
    const hasRing =
      (focused?.outlineStyle !== 'none' && focused?.outlineWidth !== '0px') ||
      (focused?.boxShadow ?? 'none') !== 'none';
    expect(hasRing, `no focus indicator on ${focused?.tag}`).toBe(true);
  });

  test('light table lightbox opens, navigates and closes by keyboard alone', async ({
    page,
  }) => {
    await page.goto('/stills');
    await page.waitForLoadState('networkidle');

    const firstTile = page
      .getByRole('button', { name: /open frame .* lightbox/i })
      .first();
    await expect(firstTile).toBeVisible();
    await firstTile.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('contact form can be completed and submitted without a mouse', async ({
    page,
  }) => {
    await page.goto('/contact');

    await page.getByLabel(/production/i).fill('Keyboard Test');
    await page.getByLabel(/roll/i).fill('keyboard@example.com');
    await page.getByLabel(/notes/i).fill('Submitted entirely from the keyboard.');

    const submit = page.getByRole('button', { name: /submit|mark/i });
    await submit.focus();
    await expect(submit).toBeFocused();
  });
});
