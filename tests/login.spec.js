import { test, expect } from '@playwright/test';

  test.beforeEach(async ({ page }) => {
    await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com/my-account/');
  });

  const adminUsername = 'skhot';
  const adminPassword = 'GpmAsen$2024';

  const customerEmail = 'a45832718@gmail.com';
  const customerPassword = 'U5sfFJ7qbKTNE5U';

  const invalidUsername = 'invaliduser';
  const invalidEmail = 'invalid@test.com';
  const invalidPassword = 'WrongPassword123';

  // ===========================
  // Admin Login
  // ===========================
  test('Verify login with valid username (Admin)', async ({ page }) => {

    await page.fill('#username', adminUsername);
    await page.locator('button[value="Use Password"]').click();
    await page.fill('#password', adminPassword);
    await page.locator('button[value="Login"]').click();

    await expect(page).toHaveURL(/my-account/);
    await expect(page.locator('.woocommerce-MyAccount-menu')).toBeVisible();
  });

  // ===========================
  // Customer Login using Email
  // ===========================
  test('Verify login with valid email', async ({ page }) => {

    await page.getByRole('textbox', { name: 'Username or email address *' }).fill(customerEmail);
    await page.getByRole('button', { name: 'Use Password' }).click();
    await page.locator('#password').fill(customerPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: /Hello/i })).toBeVisible();
  });

  // ===========================
  // Invalid Username
  // ===========================
  test('Verify login with invalid username', async ({ page }) => {

    await page.fill('#username', invalidUsername);
    await page.locator('button[value="Use Password"]').click();
    await page.fill('#password', adminPassword);
    await page.locator('button[value="Login"]').click();

    await expect(page.locator('.woocommerce-error')).toContainText(
      'The username or password you entered is incorrect'
    );
  });

  // ===========================
  // Invalid Email
  // ===========================
  test('Verify login with invalid email', async ({ page }) => {

    await page.fill('#username', invalidEmail);
    await page.locator('button[value="Use Password"]').click();
    await page.fill('#password', customerPassword);
    await page.locator('button[value="Login"]').click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  // ===========================
  // Valid Username + Invalid Password
  // ===========================
  test('Verify login with valid username and invalid password', async ({ page }) => {

    await page.fill('#username', adminUsername);
    await page.locator('button[value="Use Password"]').click();
    await page.fill('#password', invalidPassword);
    await page.locator('button[value="Login"]').click();

    await expect(page.locator('.woocommerce-error')).toContainText(
      'The username or password you entered is incorrect'
    );
  });

  // ===========================
  // Blank Username
  // ===========================
  test('Verify login with blank username', async ({ page }) => {

    await page.locator('button[value="Use Password"]').click();
    await page.fill('#password', adminPassword);

    await page.locator('button[value="Login"]').click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  // ===========================
  // Blank Password
  // ===========================
  test('Verify login with blank password', async ({ page }) => {

    await page.fill('#username', adminUsername);
    await page.locator('button[value="Use Password"]').click();

    await page.locator('button[value="Login"]').click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  // ===========================
  // Remember Me Checkbox
  // ===========================
  test('Verify Remember me checkbox', async ({ page }) => {

    await page.getByText('Use Password').click();

    const rememberCheckbox = page.locator('#rememberme');
    const rememberLabel = page.locator('label[for="rememberme"]');

    await rememberLabel.click();

    await expect(rememberCheckbox).toBeChecked();
  });

  // ===========================
  // Lost Password Page
  // ===========================
  test('Verify user receives reset password confirmation', async ({ page }) => {

    await page.getByText('Use Password').click();

    await page.locator('.woocommerce-LostPassword > a').click();

    await expect(page).toHaveURL(/lost-password/);

    await page.fill('#user_login', customerEmail);

    await page.locator('.woocommerce-Button').click();

    const passwordResetMessage =
      /Password reset email has been sent\.|A password reset email has been sent to the email address on file for your account/i;

    await expect(page.locator('body')).toContainText(passwordResetMessage);
  });

  // ===========================
  // Magic Link Button
  // ===========================
  test('Verify Magic Link request', async ({ page }) => {

    await page.fill('#username', customerEmail);

    await page.getByRole('button', { name: 'Magic Link' }).click();

    await expect(page.locator('body')).toContainText(/magic link|check your email|email/i);
  });

  // ===========================
  // Password Visibility
  // ===========================
  test('Verify user can view password using eye icon', async ({ page }) => {

    await page.getByText('Use Password').click();

    const password = page.locator('#password');

    await password.fill(customerPassword);

    await expect(password).toHaveAttribute('type', 'password');

    const eyeIcon = page.locator('form').filter({ hasText: 'Username or email address *' }).getByLabel('Show password');

    await eyeIcon.click();

    await expect(password).toHaveAttribute('type', 'text');
  });

