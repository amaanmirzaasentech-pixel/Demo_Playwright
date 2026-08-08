import { test, expect } from '@playwright/test';

const pageUrl = 'https://sewdailystg:e9554e0c@stage.sewdaily.com/makers-club/about/';


  test.beforeEach(async ({ page }) => {
    await page.goto(pageUrl);
    await expect(page).toHaveURL(/makers-club\/about/);
  });

  test('Verify Header and top navigation', async ({ page }) => {
    await expect(page.locator('.site-header.site-header--bb')).toBeVisible();
    await expect(page.locator('#primary-navbar')).toBeVisible();
    await expect(page.getByRole('link', { name: 'BECOME A MEMBER' })).toBeVisible();
  });

  test('Verify every visible CTA button or CTA-style link is enabled/clickable', async ({ page }) => {
    const ctas = page.locator('.wp-block-button__link.wp-element-button');
    const count = await ctas.count();

    for (let i = 0; i < count; i++) {
      const cta = ctas.nth(i);

      if (await cta.isVisible()) {
        await expect(cta).toBeEnabled();
        await expect(cta).toBeVisible();

        if ((await cta.getAttribute('href')) !== null) {
          await expect(cta).toHaveAttribute('href', /.+/);
        }
      }
    }
  });

  test('Verify Hero banner and primary CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to the' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sew Daily Makers Club' })).toBeVisible();

    const heroCta = page.getByRole('link', { name: 'Yes, I want in!' }).first();
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toBeEnabled();
  });

  test('Verify landing page sections are displayed', async ({ page }) => {
    await expect(page.locator('.wp-image-10663932')).toBeVisible();
    await expect(page.getByText('BENEFITS', { exact: true })).toBeVisible();
    await expect(page.getByText('PROJECTS GALORE')).toBeVisible();

    const section = page.locator('.wp-block-column.centered-block.is-layout-flow.wp-block-column-is-layout-flow').nth(2);

    await expect(section.locator('p').nth(0)).toHaveText('How');
    await expect(section.locator('p').nth(1)).toHaveText('it works');
    await expect(section.locator('p').nth(2)).toHaveText('Sew on your terms, your way!');

    const heading1Locator = page.getByText(/BOUNDLESS.*INSPIRATION.*ADVICE/i);
    const headingText1 = await heading1Locator.evaluate(el =>
      el.textContent?.replace(/\u200B/g, '').replace(/\s+/g, ' ').trim()
    );

    expect(headingText1).toBe("BOUNDLESSINSPIRATION& ADVICE!");

    await expect(page.getByText('What’s Included')).toBeVisible();

    const heading2Locator = page.getByText(/WHO ARE SEWDAILY.COM MAKERS CLUB MEMBERS/i);
    const heading2Found = await heading2Locator.isVisible({ timeout: 3000 }).catch(() => false);

    if (heading2Found) {
      const headingText2 = await heading2Locator.evaluate(el =>
        el.textContent?.replace(/\u200B/g, '').replace(/\s+/g, ' ').trim()
      );

      expect(headingText2).toBe("WHO ARE SEWDAILY.COM MAKERS CLUB MEMBERS?​");
    }

    await expect(page.getByText('For the full list of FAQs')).toBeVisible();
  });

  test('Verify project/gallery images load successfully', async ({ page }) => {
    const galleryImages = page.locator('img:not([aria-hidden="true"])');
    const imageCount = await galleryImages.count();

    if (imageCount > 0) {
      for (let index = 0; index < Math.min(imageCount, 5); index++) {
        const image = galleryImages.nth(index);

        if (await image.isVisible()) {
          await expect(image).toHaveAttribute('src', /.+/);
        }
      }
    }
  });

  test('Verify all major CTA buttons are visible and enabled', async ({ page }) => {
    const majorCtas = page.locator(
      'a, button',
      {
        hasText: /BECOME A MEMBER|Join Today|JOIN TODAY|Yes, I Want In|INSPIRE ME MORE|Join the Club Now/i
      }
    );

    const ctaCount = await majorCtas.count();
    expect(ctaCount).toBeGreaterThan(0);

    let visibleCount = 0;

    for (let index = 0; index < ctaCount && visibleCount < 3; index++) {
      const cta = majorCtas.nth(index);

      if (await cta.isVisible()) {
        await expect(cta).toBeEnabled();
        visibleCount++;
      }
    }
  });

  test('Verify newsletter signup form', async ({ page }) => {
    const newsletterForm = page.locator('form').filter({
      hasText: /sign up|subscribe|newsletter/i
    });

    const newsletterVisible = await newsletterForm.first().isVisible({ timeout: 3000 }).catch(() => false);

    if (newsletterVisible) {
      await expect(page.getByPlaceholder('Your Email Address').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /subscribe|sign up|join/i }).first()).toBeVisible();
    }
  });

  test('Verify footer is displayed', async ({ page }) => {
    const footer = page.locator('footer');

    await expect(footer).toBeVisible();
    await expect(footer.getByText(/©|Copyright|Privacy|Terms/i).first()).toBeVisible();
  });


