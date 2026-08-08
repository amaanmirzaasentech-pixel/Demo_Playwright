const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/sewing/turn-your-old-leather-jacket-into-a-trendy-backpack-adventure/`);

});

  test('Verify Article URL', async ({ page }) => {
    await expect(page).toHaveURL(
      /turn-your-old-leather-jacket-into-a-trendy-backpack-adventure/
    );
  });

  test('Verify Article Page Title', async ({ page }) => {
    await expect(page).toHaveTitle(
      /Turn Your Old Leather Jacket into a Backpack! - Sew Daily/i
    );
    console.log('Article Page Title:', await page.title());
  });

  test('Verify Article Heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /Turn Your Old Leather Jacket into a Backpack/i,
      })
    ).toBeVisible();
    console.log('Article Heading:', await page.locator('h1').textContent());
  });

  test('Verify Featured Image', async ({ page }) => {
    const heroImage = page.locator('article img').first();
    await expect(heroImage).toBeVisible();
  });

  test('Verify Author Name', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Sadie Fox Metter' })
    ).toBeVisible();
    const authorName = await page.getByRole('link', { name: 'Sadie Fox Metter' }).textContent();
    console.log('Author Name:', authorName);
  });

  test('Verify Article Content', async ({ page }) => {
    const paragraphs = page.locator('.entry-content');
    await expect(paragraphs).toBeVisible();
  });

  test('Verify Article Section Headings', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Supplies' })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Prepare' })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Paint' })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Construct' })
    ).toBeVisible();
  });

  test('Verify Images Inside Article', async ({ page }) => {
    const articleImages = page.locator('img');
    expect(await articleImages.count()).toBeGreaterThan(5);
  });

  test('Verify Newsletter or Promo Banner', async ({ page }) => {
    await expect(
      page
        .locator('text=/Become a Member|Become a Sew Daily Member/i')
        .first()
    ).toBeVisible();
  });

  test("Verify Editor's Picks Section", async ({ page }) => {
    await expect(
      page.getByText(/Editor's Picks/i)
    ).toBeVisible();
  });

  test('Verify Footer Newsletter Section', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Sign up for our newsletter',
      })
    ).toBeVisible();
  });

  test('Verify Footer', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });


  test('Verify Social Share Icons', async ({ page }) => {
    const socialIcons = page.locator(
      'a[href*="facebook"], a[href*="twitter"], a[href*="pinterest"], .share-icons a'
    );
    expect(await socialIcons.count()).toBeGreaterThan(0);
  });

  test('Verify Editor Picks Section', async ({ page }) => {
    const cards = page.locator('.owl-item.active');
    expect(await cards.count()).toBeGreaterThan(2);
  });

  test('Verify Newsletter Form', async ({ page }) => {
    await expect(
      page.locator('.textwidget.custom-html-widget').nth(2)
    ).toBeVisible();

  });
  test('Verify All Links in Article', async ({ page }) => {

    const links = page.locator('article a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
    }
  })
