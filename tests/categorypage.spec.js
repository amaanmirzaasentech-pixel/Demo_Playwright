const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/category/sewing/`);
});

  test('Verify Sewing Category Page URL', async ({ page }) => {
    await expect(page).toHaveURL(/category\/sewing/);
  });

   test('Verify page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sewing Articles|Sew Daily/i);
   });
   test('Verify site logo is visible', async ({ page }) => {
    
    await expect(page.locator('.bb-logo')).toBeVisible();
   });
   test('Verify main page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Sewing Articles/i })
    ).toBeVisible();
   });

   test('Verify featured article section', async ({ page }) => {
    // 
    const featuredArticle = page.locator('.page-title');
    await expect(featuredArticle).toBeVisible();
   });
    test('Verify Latest Articles heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Latest Articles/i })
      ).toBeVisible();
    });

    test('Verify article cards are displayed', async ({ page }) => {
      const articleCards = page.locator('.popular-articles-container');
      await expect(articleCards.first()).toBeVisible();
      expect(await articleCards.count()).toBeGreaterThanOrEqual(9);
    });

    test('Verify pagination section', async ({ page }) => {
      await expect(page.locator('.pagination-category')).toBeVisible();
    });

    test('Verify newsletter signup section', async ({ page }) => {
      await expect(
        page.getByText(/Sign up for our newsletter/i)
      ).toBeVisible();
    });

    test('Verify newsletter email signup form', async ({ page }) => {
    await expect(
      page
        .locator('#sd_nl_signup_foot_2025')
        .contentFrame()
        .locator('body')
    ).toBeVisible({ timeout: 10000 });
    });

    test('Verify footer section', async ({ page }) => {
      await expect(
        page.locator('div')
          .filter({ hasText: 'Patterns, embroidery designs' })
          .nth(1)
      ).toBeVisible();
    });

  // Verify all images on the category page are loaded successfully
  test('Verify Images are Loaded', async ({ page }) => {

    const images = page.locator('img');
    const count = await images.count();

    expect(count).toBeGreaterThan(5);

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);

      const loaded = await image.evaluate((img) => {
        return img.complete && img.naturalWidth > 0;
      });

      expect(loaded).toBeTruthy();
    }
  });

  // Verify pagination navigates to the next page successfully
  test('Verify Pagination Navigation', async ({ page }) => {

    const nextPage = page.locator('a:has-text("Next"), .next');

    if (await nextPage.count()) {
      await nextPage.first().click();

      // Verify user is redirected to the next page
      await expect(page).toHaveURL(/page|paged|\/2/);
    }
  });

  // Verify an article opens successfully from the category page
  test('Verify Article Opens Successfully', async ({ page }) => {

    // Locate the first article
    const firstArticle = page.locator('h2 a').first();
    await expect(firstArticle).toBeVisible({ timeout: 10000 });

    // Store article title
    const firstArticleTitle =
      (await firstArticle.textContent())?.trim() || '';

    // Open the article
    await firstArticle.click();
    await page.waitForLoadState('load');

    // Verify navigation away from category page
    await expect(page).not.toHaveURL(/category\/sewing/);

    // Verify article heading is displayed
    const articleHeading = page.locator(
      'article h1, article h2, h1.entry-title, h1.post-title'
    ).first();

    await expect(articleHeading).toBeVisible({ timeout: 15000 });

    // Verify article heading matches the selected article
    if (firstArticleTitle) {
      await expect(articleHeading).toContainText(firstArticleTitle, {
        timeout: 10000,
      });
    }
  });
