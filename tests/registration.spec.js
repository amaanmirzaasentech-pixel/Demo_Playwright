import { test, expect } from '@playwright/test';

  test.beforeEach(async ({ page }) => {

    await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com/my-account/');

    // Handle cookie banner if displayed
    const acceptButton = page.getByRole('button', {
      name: /Accept|Accept All|Agree|Got it/i
    });

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
    }
  });

    function randomUser() {

    const random = Math.random().toString(36).substring(2, 8);

    return {
      username: `user_${random}`,
      email: `test_${random}@mailinator.com`,
      password: 'DY2sQ2FFNGfb!jU'
    };
  }
  // ==========================================
  // Valid Registration
  // ==========================================
   test('Verify user can successfully register with valid details', async ({ page }) => {

    const user = randomUser();

    await page.fill('#reg_username', user.username);
    await page.fill('#reg_email', user.email);
    await page.fill('#reg_password', user.password);

    await page.locator('button[name="register"]').click();

  await Promise.race([
    page.waitForURL(/my-account/, { timeout: 150000 }),
    page.locator('.woocommerce-MyAccount-content, .woocommerce-message, .woocommerce-error').waitFor({ timeout: 150000 })
  ]);
  await expect(page).toHaveURL(/my-account/);
});
 
  // ==========================================
  // Invalid Username
  // ==========================================
  test('Verify registration with invalid username', async ({ page }) => {
    await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com/my-account/');
    const user = randomUser();
    await page.fill('#reg_username', '@@@###');

    await page.fill('#reg_email', user.email);

    await page.fill('#reg_password', user.password);

    await page.locator('button[name="register"]').click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  // ==========================================
  // Blank Registration
  // ==========================================
  test('Verify registration without entering any details', async ({ page }) => {

    await page.locator('button[name="register"]').click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  // ==========================================
  // Password Eye Icon
  // ==========================================
  test('Verify user can view password using eye icon', async ({ page }) => {

    await page.fill('#reg_password', 'DY2sQ2FFNGfb!jU');

    const password = page.locator('#reg_password');

    await expect(password).toHaveAttribute('type', 'password');

    await page.locator('button.show-password-input').nth(1).click();
  });

  // ==========================================
  // Register Button Enabled
  // ==========================================
  test('Verify Register button is enabled', async ({ page }) => {

    const registerButton = page.locator('button[name="register"]');

    await expect(registerButton).toBeEnabled();
  });
