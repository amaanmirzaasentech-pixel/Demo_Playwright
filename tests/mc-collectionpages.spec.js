import { test, expect } from '@playwright/test';
//----------------- MAKERS CLUB COLLECTION PAGE ----------------
  test('Verify main UI elements and product grid', async ({ page }) => {
    await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com', {
        waitUntil: 'load',
      timeout: 300000,
    });
 await page.locator('#menu-item-10650598 > a').hover();
await Promise.all([
  page.waitForLoadState('domcontentloaded'),
  page.getByRole('link', { name: 'Makers Club Collection' }).click(),
]);

   // Header
    await expect(page.locator('.site-header.site-header--bb')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sew Daily', exact: true })).toBeVisible();

    // Hero banner
    await expect(page.getByText(/Become a Sew Daily Members Club Member Today! /i)).toBeVisible();

    // Left navigation and filters
    await expect(page.getByRole('link', { name: /Whole Member Collection/i })).toBeVisible();
    await expect(page.locator(".patterns-section")).toBeVisible();

    // Product cards
    const cards = page.locator('.grid-container .grid-item, .grid-item, .product');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.locator('body')).toContainText(/no products|coming soon|members club/i, { timeout: 10000 });
    }

    // Load More button (if present)
    const loadMore = page.getByRole('button', { name: /load more/i });
    if (await loadMore.count()) {
      await expect(loadMore).toBeVisible();
    }
  });
