const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('.f-button.is-close-btn').click().catch(() => {}); // Close the popup if it appears
});

// ---------------- FOOTER ----------------
  test('Verify Footer is displayed', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Verify Sew Daily logo is displayed in Footer', async ({ page }) => {
    const footerLogo = page.getByRole('link', { name: 'Sew Daily White Logo' });
    await expect(footerLogo).toBeVisible();
  });

  test('Verify Footer description text is displayed', async ({ page }) => {
    await expect(
      page.getByText(
        'Patterns, embroidery designs, exclusive video content and detailed, how-to instruction for the sewing community.'
      )
    ).toBeVisible({ timeout: 5000 });
  });

  test('Verify Advertise link in Footer', async ({ page }) => {
    const advertiseLink = page.getByRole('link', { name: 'Advertise' });
    await expect(advertiseLink).toBeVisible();
    await expect(advertiseLink).toHaveAttribute('href', '/advertise/');
  });

test('Verify Contact Us link opens successfully', async ({ page }) => {
  const contactUsLink = page.getByRole('link', { name: 'Contact Us' });

  await expect(contactUsLink).toBeVisible();

  const [response] = await Promise.all([
    page.waitForResponse(response =>
      response.url().includes('support.goldenpeakmedia.com') &&
      response.status() === 200
    ),
    contactUsLink.click()
  ]);

  expect(response.status()).toBe(200);
})

  test('Verify FAQs link in Footer', async ({ page }) => {
    const faqsLink = page.getByRole('link', { name: 'FAQs' });
    await expect(faqsLink).toBeVisible();
    await expect(faqsLink).toHaveAttribute(
      'href',
      'https://support.goldenpeakmedia.com/portal/en/kb/golden-peak-media/sew-daily'
    );
  });

  test('Verify About Us link in Footer', async ({ page }) => {
    const aboutUsLink = page.getByRole('link', { name: 'About Us' });
    await expect(aboutUsLink).toBeVisible();
    await expect(aboutUsLink).toHaveAttribute('href', '/about/');
  });

  test('Verify Subscriptions link in Footer', async ({ page }) => {
    const subscriptionLink = page.getByRole('link', { name: 'Subscriptions' });
    await expect(subscriptionLink).toBeVisible();
    await expect(subscriptionLink).toHaveAttribute('href', '/my-account/');
  });

  test('Verify Copyright text is displayed in Footer', async ({ page }) => {
    await expect(page.getByText(/©|Copyright/i)).toBeVisible();
  });

  test('Verify Privacy Policy link in Footer', async ({ page }) => {
    const privacyPolicy = page.getByRole('link', { name: /Privacy Policy/i });
    await expect(privacyPolicy).toBeVisible();
  });

  test('Verify Terms and Conditions link in Footer', async ({ page }) => {
    const termsLink = page.getByRole('link', { name: /Terms/i });
    await expect(termsLink).toBeVisible();
  });
