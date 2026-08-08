const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://sewdailystg:e9554e0c@stage.sewdaily.com/my-account/');
  console.log('username field count', await page.locator('#username').count());
  console.log('username visible', await page.isVisible('#username'));
  console.log('password field count', await page.locator('#password').count());
  console.log('password visible before click', await page.isVisible('#password'));
  const usePasswordLocator = page.locator('button[value="Use Password"]');
  console.log('use password button count', await usePasswordLocator.count());
  console.log('use password button visible', await usePasswordLocator.isVisible());
  if (await usePasswordLocator.count()) {
    console.log('use password outerHTML', await usePasswordLocator.evaluate(node => node.outerHTML));
  }
  const showPasswordLocator = page.locator('button.show-password-input');
  console.log('show password button count', await showPasswordLocator.count());
  if (await showPasswordLocator.count()) {
    console.log('show-password-input outerHTML', await showPasswordLocator.nth(0).evaluate(node => node.outerHTML));
  }
  console.log('login button count', await page.getByRole('button', { name: 'Login' }).count());
  console.log('submit input count', await page.locator('input[type="submit"]').count());
  if (await page.locator('#customer_login').count()) {
    console.log('customer_login innerHTML:', (await page.locator('#customer_login').innerHTML()).slice(0,1000));
  }
  await page.fill('#username', 'skhot');
  await page.click('button[value="Use Password"]');
  await page.waitForTimeout(1000);
  console.log('password visible after click', await page.isVisible('#password'));
  console.log('password offsetHeight', await page.locator('#password').evaluate(node => node.offsetHeight));
  await page.fill('#password', 'GpmAsen$2024');
  await page.click('button[value="Login"]');
  await page.waitForLoadState('load');
  await page.waitForTimeout(5000);
  console.log('after login url', page.url());
  const ordersLink = page.locator('.woocommerce-MyAccount-navigation-link--orders a');
  const downloadsLink = page.locator('.woocommerce-MyAccount-navigation-link--downloads a');
  const addressesLink = page.locator('.woocommerce-MyAccount-navigation-link--edit-address a');
  const accountDetailsLink = page.locator('.woocommerce-MyAccount-navigation-link--edit-account a');
  console.log('orders link count', await ordersLink.count());
  console.log('downloads link count', await downloadsLink.count());
  console.log('addresses link count', await addressesLink.count());
  console.log('account details count', await accountDetailsLink.count());
  await addressesLink.click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);
  console.log('after addresses url', page.url());
  console.log('after addresses accountDetails count', await accountDetailsLink.count());
  console.log('after addresses accountDetails visible', await accountDetailsLink.isVisible());
  console.log('nav innerHTML snippet', (await page.locator('.woocommerce-MyAccount-menu').innerHTML()).slice(0,500));
  await browser.close();
})();
