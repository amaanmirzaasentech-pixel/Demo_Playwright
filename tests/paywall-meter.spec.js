const { test, expect } = require('@playwright/test');


const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';             
const PAYWALL_ARTICLE_URL = `${BASE_URL}/sewing/sew-a-citrus-summer/`;   
const FREE_ARTICLE_URL = `${BASE_URL}/free/transform-your-trench-upcycle-your-coat-into-a-chic-fall-vest/`; 
const Registration_URL = `${BASE_URL}/my-account/`;      

const SUBSCRIBER_USER = { email: 'subscriber@example.com', password: 'Password123!' };
const ADMIN_USER = { email: 'admin@example.com', password: 'Password123!' };
const EDITOR_USER = { email: 'editor@example.com', password: 'Password123!' };
const GUEST_USER = { email: 'guest@example.com', password: 'Password123!' };


// ------------------------------
// TC_Paywall Meter_01
// Verify that the paywall meter is displayed correctly on articles.
// ------------------------------
test('TC_Paywall Meter_01 - Verify paywall meter displays correct text options', async ({ page }) => {
  await page.goto(PAYWALL_ARTICLE_URL);

  // Main heading
  await expect(
    page.locator('#step-one h2')
  ).toHaveText('Continue reading with one of the options below.');

  // Already a subscriber
  await expect(
    page.locator('#step-one .black-banner-footer-link')
  ).toContainText('Already a subscriber?');

  await expect(
    page.locator('#step-one .black-banner-footer-link a')
  ).toHaveText('Sign in');

  // Free Account section
  const freeAccount = page.locator('.black-banner-footer-section').nth(0);

  await expect(
    freeAccount.locator('#black-banner-right-header')
  ).toHaveText('Free Account');

  await expect(
    freeAccount.getByText('Unlock this article')
  ).toBeVisible();

  await expect(
    freeAccount.getByText('Continue reading more content')
  ).toBeVisible();

  await expect(
    freeAccount.getByText('Free newsletter')
  ).toBeVisible();

  await expect(
    freeAccount.locator('a.black-banner-button.register')
  ).toHaveText('Register for free');

  // Makers Club section
  const makersClub = page.locator('.black-banner-footer-section').nth(1);

  await expect(
    makersClub.locator('#black-banner-right-header')
  ).toHaveText('Sew Daily Makers Club');

  await expect(
    makersClub.getByText('Year-round access to premium SewDaily.com')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Member-only patterns')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Makers Club projects in your inbox')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Member-only discounts and specials')
  ).toBeVisible();

  await expect(
    makersClub.locator('a.black-banner-button.join')
  ).toHaveText('Join');
});


// ------------------------------
// TC_Paywall Meter_02
// Verify that clicking "Already a subscriber? Sign in" leads to the sign-in page.
// ------------------------------
test('TC_Paywall Meter_02 - sign in link redirects to sign-in page', async ({ page }) => {
  await page.goto(PAYWALL_ARTICLE_URL);

  await page.click('text=Sign in');

  await expect(page).toHaveURL(/my-account/i);
});


// ------------------------------
// TC_Paywall Meter_03
// Verify that clicking "Register for free" initiates the free account registration process.
// ------------------------------
test('TC_Paywall Meter_03 - register for free button opens registration popup', async ({ page }) => {
  await page.goto(PAYWALL_ARTICLE_URL);

  await page.click('text=Register for free');

  await expect(page).toHaveURL('https://stage.sewdaily.com/sewing/sew-a-citrus-summer/#');
});

// ------------------------------
// TC_Paywall Meter_04
// Verify that clicking "Join" opens the Makers Club subscription popup window.
// ------------------------------
test('TC_Paywall Meter_04 - Join button opens Makers Club page', async ({ page, context }) => {
  await page.goto(PAYWALL_ARTICLE_URL);
  await page.getByRole('link', { name: 'Join' }).click();
   await page.waitForLoadState();
  await expect(page).toHaveURL('https://stage.sewdaily.com/makers-club/about/');
});

// ------------------------------
// TC_Paywall Meter_05
// Verify "Sign up for a free account to Unlock this article" flow and Makers Club popup.
// ------------------------------
test('TC_Paywall Meter_05 - unlock article via registration and check the article content', async ({ page, context }) => {
  function randomUser() {
    const random = Math.random().toString(36).substring(2, 8);
    return {
      username: `user_${random}`,
      email: `test_${random}@mailinator.com`,
      password: 'DY2sQ2FFNGfb!jU'
    };
  }

  // Generate random user
  const user = randomUser();

  console.log('Registered Email:', user.email);

  // -----------------------
  // User Registration
  // -----------------------
  await page.goto(Registration_URL);
  await page.fill('#reg_username', user.username);
  await page.fill('#reg_email', user.email);
  await page.fill('#reg_password', user.password);
  await page.click('button[name="register"]');

  // Verify registration
  await expect(page).toHaveURL(/my-account/);
  await page.getByRole('link', { name: 'Log out' }).click();
  // -----------------------
  // Open WordPress Admin
  // -----------------------

    await page.goto(Registration_URL);

  // Login as admin
  await page.fill('#username', 'skhot');
  await page.click('button[value="Use Password"]');
  await page.fill('#password', 'GpmAsen$2024');
  await page.click('button[value="Login"]');
  
  // -----------------------
  // Search User
  // -----------------------
  await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com/wp-admin/users.php',{ waitUntil: 'networkidle' });

  // Search using registered email
  await page.locator('#user-search-input').fill(user.email);
  await page.click('#search-submit');
  // Verify searched user exists
  await expect(page.locator('.email.column-email')).toContainText(user.email);
  console.log(`Verified user: ${user.email}`);
  await page.locator('.edit').first().click();
  // After completing the flow, check the article content is now accessible
//   await page.goto(PAYWALL_ARTICLE_URL);
//   await expect(page.locator('.entry-content')).toBeVisible(); 
//   for (let i = 0; i < 20; i++) {
//   await page.mouse.wheel(0, 1000);
//   await page.waitForTimeout(200);
// }
});


// ------------------------------
// TC_Paywall Meter_06
// Verify the paywall meter displays and functions correctly on mobile devices.
// ------------------------------
test('TC_Paywall Meter_06 - paywall meter works on mobile viewport', async ({ browser }) => {
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone-like viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const browserPage = await mobileContext.newPage();

  await browserPage.goto(PAYWALL_ARTICLE_URL);

    await expect(
    browserPage.locator('div[class=black-banner-footer-main] h2')
  ).toHaveText('Continue reading with one of the options below.');

  // Already a subscriber
  await expect(
    browserPage.locator('#step-one .black-banner-footer-link')
  ).toContainText('Already a subscriber?');

  await expect(
    browserPage.locator('#step-one .black-banner-footer-link a')
  ).toHaveText('Sign in');

  // Free Account section
  const freeAccount = browserPage.locator('.black-banner-footer-section').nth(0);

  await expect(
    freeAccount.locator('#black-banner-right-header')
  ).toHaveText('Free Account');

  await expect(
    freeAccount.getByText('Unlock this article')
  ).toBeVisible();

  await expect(
    freeAccount.getByText('Continue reading more content')
  ).toBeVisible();

  await expect(
    freeAccount.getByText('Free newsletter')
  ).toBeVisible();

  await expect(
    freeAccount.locator('a.black-banner-button.register')
  ).toHaveText('Register for free');

  // Makers Club section
  const makersClub = browserPage.locator('.black-banner-footer-section').nth(1);

  await expect(
    makersClub.locator('#black-banner-right-header')
  ).toHaveText('Sew Daily Makers Club');

  await expect(
    makersClub.getByText('Year-round access to premium SewDaily.com')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Member-only patterns')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Makers Club projects in your inbox')
  ).toBeVisible();

  await expect(
    makersClub.getByText('Member-only discounts and specials')
  ).toBeVisible();

  await expect(
    makersClub.locator('a.black-banner-button.join')
  ).toHaveText('Join');

  await mobileContext.close();
});

// ------------------------------
// TC_Paywall Meter_07
// Verify that after logging out, the paywall meter displays for non-subscribed users.
// ------------------------------
test('TC_Paywall Meter_07 - paywall meter shows for proper validation', async ({ page }) => {
  await page.goto(PAYWALL_ARTICLE_URL);

   await page.click('text=Register for free');

  function randomUser() {
    const random = Math.random().toString(36).substring(2, 8);
    return {
      username: `user_${random}`,
      email: `test_${random}@mailinator.com`,
    };
  }
    const user = randomUser();
    await page.fill('input[placeholder="Enter your Email Address"]', user.username);
    await page.fill('input[placeholder="Username (optional)"]', user.email);
    await page.locator('a[class="black-banner-button continue"]').first().click();
    await page.locator('span[class="error username"]').waitFor({ state: 'visible' });
    await page.locator('span[class="error email"]').waitFor({ state: 'visible' });
});


// ------------------------------
// TC_Paywall Meter_09
// Verify that after canceling a subscription, the paywall meter displays correctly.
// ------------------------------
test('TC_Paywall Meter_09 - paywall meter shows after subscription cancellation', async ({ page }) => {
  // Log in - UPDATE ME
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#email', SUBSCRIBER_USER.email);
  await page.fill('#password', SUBSCRIBER_USER.password);
  await page.click('button[type="submit"]');

  // Cancel subscription - UPDATE ME with your real cancellation flow
  await page.goto(`${BASE_URL}/account/subscription`);
  await page.click('text=Cancel Subscription');
  await page.click('text=Confirm'); // UPDATE ME if there's a confirmation step

  await page.goto(PAYWALL_ARTICLE_URL);
  await expect(page.locator('text=Register for free')).toBeVisible();
});


// ------------------------------
// TC_Paywall Meter_10
// Verify different user roles see appropriate paywall options.
// ------------------------------
async function loginAs(page, user) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#email', user.email);       // UPDATE ME
  await page.fill('#password', user.password); // UPDATE ME
  await page.click('button[type="submit"]');   // UPDATE ME
}

test('TC_Paywall Meter_10 - paywall options differ by user role', async ({ page }) => {
  const roles = [
    { name: 'admin', user: ADMIN_USER },
    { name: 'editor', user: EDITOR_USER },
    { name: 'guest', user: GUEST_USER }
  ];

  for (const role of roles) {
    await loginAs(page, role.user);
    await page.goto(PAYWALL_ARTICLE_URL);

    // UPDATE ME - assertions will differ per role, this is just a placeholder check
    await expect(page.locator('body')).toBeVisible();

    await page.goto(`${BASE_URL}/logout`);
  }
});


// ------------------------------
// TC_Paywall Meter_11
// Verify the paywall meter correctly displays the number of free articles available.
// ------------------------------
test('TC_Paywall Meter_11 - free article count displays correctly and persists on refresh', async ({ page }) => {
  await loginAs(page, GUEST_USER);
  await page.goto(PAYWALL_ARTICLE_URL);

  const meterText = await page.locator('.paywall-meter-count').innerText(); // UPDATE ME - real selector
  console.log('Free articles remaining:', meterText);

  await page.reload();
  const meterTextAfterReload = await page.locator('.paywall-meter-count').innerText();

  expect(meterTextAfterReload).toBe(meterText);
});


// ------------------------------
// TC_Paywall Meter_12
// Verify the paywall meter accurately decreases after viewing a free article.
// ------------------------------
test('TC_Paywall Meter_12 - meter count decreases after viewing a free article', async ({ page }) => {
  await loginAs(page, GUEST_USER);

  await page.goto(PAYWALL_ARTICLE_URL);
  const countBeforeText = await page.locator('.paywall-meter-count').innerText(); // UPDATE ME
  const countBefore = parseInt(countBeforeText.replace(/\D/g, ''), 10);

  await page.goto(FREE_ARTICLE_URL);

  await page.goto(PAYWALL_ARTICLE_URL);
  const countAfterText = await page.locator('.paywall-meter-count').innerText();
  const countAfter = parseInt(countAfterText.replace(/\D/g, ''), 10);

  expect(countAfter).toBe(countBefore - 1);
});


// ------------------------------
// TC_Paywall Meter_13
// Verify the paywall meter prompts users to subscribe when the free article limit is reached.
// ------------------------------
test('TC_Paywall Meter_13 - subscribe prompt shows when free limit reached', async ({ page }) => {
  await loginAs(page, GUEST_USER);

  // UPDATE ME - loop through free articles until the limit is reached,
  // or use a test account that is pre-configured to already be at the limit.
  await page.goto(PAYWALL_ARTICLE_URL);

  await expect(page.locator('text=Unlock this article')).toBeVisible();
  await expect(page.locator('text=Join')).toBeVisible();
});


// ------------------------------
// TC_Paywall Meter_14
// Verify the paywall meter functions correctly in incognito/private browsing mode.
// ------------------------------
test('TC_Paywall Meter_14 - paywall meter works in incognito/private context', async ({ browser }) => {
  // A fresh browser context with no stored cookies/localStorage simulates "incognito"
  const incognitoContext = await browser.newContext();
  const incognitoPage = await incognitoContext.newPage();

  await incognitoPage.goto(PAYWALL_ARTICLE_URL);

  await expect(incognitoPage.locator('text=Register for free')).toBeVisible();

  await incognitoContext.close();
});


// ------------------------------
// TC_Paywall Meter_15
// Verify the paywall meter behaves correctly after clearing cookies/cache.
// ------------------------------
test('TC_Paywall Meter_15 - paywall meter resets after clearing cookies', async ({ page, context }) => {
  await loginAs(page, GUEST_USER);
  await page.goto(PAYWALL_ARTICLE_URL);

  // Clear cookies to simulate a cleared session
  await context.clearCookies();

  await page.goto(PAYWALL_ARTICLE_URL);
  await expect(page.locator('text=Register for free')).toBeVisible();
});


// ------------------------------
// TC_Paywall Meter_16
// Verify the paywall meter works consistently across different web browsers.
// ------------------------------
// NOTE: To actually run this across Chrome, Firefox, Safari (WebKit) and Edge,
// configure multiple "projects" in playwright.config.js, e.g.:
//
// module.exports = {
//   projects: [
//     { name: 'chromium', use: { browserName: 'chromium' } },
//     { name: 'firefox',  use: { browserName: 'firefox' } },
//     { name: 'webkit',   use: { browserName: 'webkit' } },
//   ],
// };
//
// Then run: npx playwright test --project=chromium --project=firefox --project=webkit
test('TC_Paywall Meter_16 - paywall meter displays correctly (cross-browser via config)', async ({ page }) => {
  await page.goto(PAYWALL_ARTICLE_URL);
  await expect(page.locator('text=Join')).toBeVisible();
});


// ------------------------------
// TC_Paywall Meter_17
// Verify meter behavior when switching between multiple user accounts.
// ------------------------------
test('TC_Paywall Meter_17 - paywall meter reflects correct status per account', async ({ page }) => {
  await loginAs(page, GUEST_USER);
  await page.goto(PAYWALL_ARTICLE_URL);
  const guestMeterText = await page.locator('.paywall-meter-count').innerText(); // UPDATE ME
  console.log('Guest account meter:', guestMeterText);

  await page.goto(`${BASE_URL}/logout`);

  await loginAs(page, SUBSCRIBER_USER);
  await page.goto(PAYWALL_ARTICLE_URL);

  // A subscriber should not see the paywall meter/limit at all
  await expect(page.locator('text=Register for free')).not.toBeVisible();
});


// ------------------------------
// TC_Paywall Meter_18
// Verify the paywall meter is synchronized across multiple devices when logged in.
// ------------------------------
test('TC_Paywall Meter_18 - meter syncs across two logged-in sessions', async ({ browser }) => {
  const deviceOneContext = await browser.newContext();
  const deviceOnePage = await deviceOneContext.newPage();
  await loginAs(deviceOnePage, GUEST_USER);
  await deviceOnePage.goto(FREE_ARTICLE_URL);

  const deviceTwoContext = await browser.newContext();
  const deviceTwoPage = await deviceTwoContext.newPage();
  await loginAs(deviceTwoPage, GUEST_USER);
  await deviceTwoPage.goto(PAYWALL_ARTICLE_URL);

  const meterOnDeviceTwo = await deviceTwoPage.locator('.paywall-meter-count').innerText(); // UPDATE ME
  console.log('Meter on second device after reading on first device:', meterOnDeviceTwo);

  // UPDATE ME - add an assertion comparing expected count once the real
  // starting count for GUEST_USER is known.

  await deviceOneContext.close();
  await deviceTwoContext.close();
});


// ------------------------------
// TC_Paywall Meter_19
// Verify the paywall meter correctly handles different article types (article, video).
// ------------------------------
test('TC_Paywall Meter_19 - paywall meter works for different content types', async ({ page }) => {
  const contentUrls = [
    `${BASE_URL}/article-with-paywall`,  // UPDATE ME
    `${BASE_URL}/video-with-paywall`     // UPDATE ME
  ];

  for (const url of contentUrls) {
    await page.goto(url);
    await expect(page.locator('text=Join')).toBeVisible();
  }
});