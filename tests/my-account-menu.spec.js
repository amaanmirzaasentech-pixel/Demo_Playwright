const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com/my-account/';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
});
test('Verify My Account navigation links', async ({ page }) => {
  // Login before this step
   const customerEmail = 'a45832718@gmail.com';
  const customerPassword = 'U5sfFJ7qbKTNE5U';
await page.getByRole('textbox', { name: 'Username or email address *' }).fill(customerEmail);
    await page.getByRole('button', { name: 'Use Password' }).click();
    await page.locator('#password').fill(customerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
  const menuItems = [
    {
      name: 'Dashboard',
      url: '/my-account/'
    },
    {
      name: 'Orders',
      url: '/my-account/orders/'
    },
    {
      name: 'My Membership',
      url: '/my-membership-details/'
    },
      {
      name: 'Back to Dashboard',
      url: '/my-account/'
    },
    {
      name: 'Gift Cards',
      url: '/my-account/gift-cards/'
    },
    {
      name: 'My Subscription',
      url: '/my-account/view-subscription/10668427/'
    },
    {
      name: 'Downloads',
      url: '/my-account/downloads/'
    },
    {
      name: 'Addresses',
      url: '/my-account/edit-address/'
    },
    {
      name: 'Payment methods',
      url: '/my-account/payment-methods/'
    },
    {
      name: 'Account details',
      url: '/my-account/edit-account/'
    }
  ];

  for (const item of menuItems) {
    const link = page
      .locator('.woocommerce-MyAccount-navigation')
      .getByRole('link', { name: item.name });

    await expect(link).toBeVisible();

    await link.click();

    await expect(page).toHaveURL(new RegExp(`${item.url}$`));
  }
});

test('Verify Logout redirects to Home page', async ({ page }) => {
      // Login before this step
    const customerEmail = 'a45832718@gmail.com';
    const customerPassword = 'U5sfFJ7qbKTNE5U';
    await page.getByRole('textbox', { name: 'Username or email address *' }).fill(customerEmail);
    await page.getByRole('button', { name: 'Use Password' }).click();
    await page.locator('#password').fill(customerPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
  const logout = page
    .getByRole('link', { name: 'Log out' })

  await expect(logout).toBeVisible();

  await logout.click();

  // Verify redirect after logout
await expect(page).toHaveURL(/stage\.sewdaily\.com/);
;
});
