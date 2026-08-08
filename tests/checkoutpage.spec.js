// SewDaily Checkout Test Cases
// Simple Playwright script (no framework, no POM)
// Run: npx playwright test sewdaily-checkout-simple.spec.js --headed

const { test, expect } = require('@playwright/test');

// ---------------------- TEST DATA ----------------------

const baseUrl = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

const accountUrl = baseUrl + '/my-account/';
const ordersUrl = baseUrl + '/my-account/orders/';
const logoutUrl = baseUrl + '/my-account/customer-logout/';
const cartUrl = baseUrl + '/cart/';
const categoryUrl = baseUrl + '/product-category/magazine-issues-sewing-magazines/';
const shopUrl = baseUrl + '/shop/';

const username = 'a45832718@gmail.com';
const password = 'U5sfFJ7qbKTNE5U';
const productId = '10647373';

// Coupon codes - change these as per your website
const validCoupon = 'NICKTEST';
const invalidCoupon = 'NOSUCHCODE123';
const expiredCoupon = 'EXPIRED2020';
const minPurchaseCoupon = 'MIN500';
const usedCoupon = 'USEDONCE';

// Test card numbers
const validCard = '4242424242424242';
const declinedCard = '4000000000000002';
const wrongCard = '4242424242424241';

// ---------------------- COMMON STEPS ----------------------

// Step 1: Login to the website
async function login(page) {
  await page.goto(accountUrl);
  await page.getByRole('textbox', { name: 'Username or email address *' }).fill(username);
  await page.getByRole('button', { name: 'Use Password' }).click();
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { name: 'Hello amaan.m' })).toBeVisible({ timeout: 30000 });
}

// Step 2: Logout from the website
async function logout(page) {
  await page.goto(logoutUrl);
  await page.waitForTimeout(2000);
}

// Step 3: Add one product in the cart
async function addProductToCart(page) {
  await page.goto(categoryUrl);
  const addToCart = page.locator('a.add_to_cart_button[data-product_id="' + productId + '"]');
  await addToCart.scrollIntoViewIfNeeded();
  await addToCart.click();
  await page.waitForTimeout(3000);
}

// Step 4: Go to the checkout page
async function openCheckout(page) {
  await page.goto(cartUrl);
  await page.getByText('Proceed to checkout').click();
  await expect(page.locator('#customer_details')).toBeVisible({ timeout: 30000 });
}

// Step 5: Fill the billing form
async function fillBilling(page) {
  await page.fill('#billing_first_name', 'Amaan');
  await page.fill('#billing_last_name', 'Mirza');
  await page.selectOption('#billing_country', 'US');
  await page.waitForTimeout(2000);
  await page.fill('#billing_address_1', '2911 Chickasaw St');
  await page.fill('#billing_city', 'Wixom');
  await page.selectOption('#billing_state', 'MI');
  await page.fill('#billing_postcode', '48393');
  await page.fill('#billing_email', 'vexisew836@ndiety.com');
  await page.waitForTimeout(3000);
}

// Step 6: Tick the terms and conditions box
async function checkTerms(page) {
  const terms = page.locator('#terms');
  await terms.scrollIntoViewIfNeeded();
  await terms.check({ force: true });
}

// Step 7: Apply a coupon code
async function applyCoupon(page, code) {
  await page.locator('a.showcoupon').click();
  await page.fill('#coupon_code', code);
  await page.click('button[name="apply_coupon"]');
  await page.waitForTimeout(4000);
}

// Step 8: Click the Place Order button
async function placeOrder(page) {
  await page.locator('#place_order').scrollIntoViewIfNeeded();
  await page.locator('#place_order').click();
  await page.waitForTimeout(6000);
}

// Step 9: Convert "$25.00" text into number 25
function getAmount(text) {
  return Number(text.replace('$', '').replace(',', '').trim());
}

// ==========================================================
//                  POSITIVE TEST CASES
// ==========================================================

test.describe('Positive - Login and User', () => {

  test('P-01 Logged in user can complete the checkout process', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
    await checkTerms(page);

    await expect(page.locator('#place_order')).toBeVisible();
    const total = await page.locator('.order-total td').innerText();
    expect(getAmount(total)).toBeGreaterThan(0);
  });

  test('P-02 Guest user can successfully proceed to checkout', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(cartUrl);
    await page.getByText('Proceed to checkout').click();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible({ timeout: 30000 });
   await page.getByRole('textbox', { name: 'Email address' }).fill('test@test.com');
   await page.locator('#wc-ev-verify-btn').click();
   await expect(page.locator("#wc-ev-msg")).toContainText('Verification email sent. Please check your inbox.');
   await expect(page.getByText('* To checkout please login or submit your email for authentication')).toBeVisible();
})
});

test.describe('Positive - Billing Information', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
  });

  test('P-03 All mandatory billing fields can be filled', async ({ page }) => {
    await fillBilling(page);

    await expect(page.locator('#billing_first_name')).toHaveValue('Amaan');
    await expect(page.locator('#billing_last_name')).toHaveValue('Mirza');
    await expect(page.locator('#billing_address_1')).toHaveValue('2911 Chickasaw St');
    await expect(page.locator('#billing_city')).toHaveValue('Wixom');
    await expect(page.locator('#billing_email')).toHaveValue('vexisew836@ndiety.com');
  });

  test('P-04 Valid billing information is accepted', async ({ page }) => {
    await fillBilling(page);
    await expect(page.locator('.woocommerce-error')).toHaveCount(0);
  });

  test('P-05 Email field accepts valid email format', async ({ page }) => {
    await page.fill('#billing_email', 'vexisew836@ndiety.com');
    await page.locator('#billing_email').blur();
    await page.waitForTimeout(2000);

    await expect(page.locator('#billing_email')).toHaveValue('vexisew836@ndiety.com');
    await expect(page.locator('#billing_email_field')).not.toHaveClass(/woocommerce-invalid/);
  });

  test('P-06 State list changes when country is changed', async ({ page }) => {
    await page.selectOption('#billing_country', 'US');
    await page.waitForTimeout(3000);
    const usStates = await page.locator('#billing_state option').count();

    await page.selectOption('#billing_country', 'IN');
    await page.waitForTimeout(3000);
    const inStates = await page.locator('#billing_state option').count();

    expect(usStates).toBeGreaterThan(1);
    expect(inStates).toBeGreaterThan(1);
    expect(inStates).not.toBe(usStates);
  });

  test('P-08 ZIP code is accepted for selected country', async ({ page }) => {
    await page.selectOption('#billing_country', 'US');
    await page.waitForTimeout(3000);
    await page.fill('#billing_postcode', '48393');
    await page.locator('#billing_postcode').blur();
    await page.waitForTimeout(2000);

    await expect(page.locator('#billing_postcode')).toHaveValue('48393');
    await expect(page.locator('#billing_postcode_field')).not.toHaveClass(/woocommerce-invalid/);
  });

});

test.describe('Positive - Shipping', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(shopUrl);
    await page.locator('a[href="/shop/?add-to-cart=10668682"]').click();
    await page.goto(cartUrl);
    await fillBilling(page);
  });

  test('P-09 Shipping methods are displayed', async ({ page }) => {
    await expect(page.locator('.woocommerce-shipping-totals')).toBeVisible();
    const count = await page.locator('#shipping_method li').count();
    expect(count).toBeGreaterThan(0);
  });

  test('P-10 User can select a shipping address', async ({ page }) => {
    const method = page.locator('#ship-to-different-address-checkbox[type="checkbox"]');
    await method.check({ force: true });
    await page.waitForTimeout(3000);
    await expect(method).toBeChecked();
  });
});

test.describe('Positive - Coupon', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-14 Valid promo code is applied successfully', async ({ page }) => {
    await applyCoupon(page, validCoupon);

    await expect(page.locator('.woocommerce-message')).toBeVisible();
    await expect(page.locator('.cart-discount')).toBeVisible();
  });

  test('P-15 Coupon discount is shown in order summary', async ({ page }) => {
    const totalBefore = getAmount(await page.locator('.order-total td').innerText());

    await applyCoupon(page, validCoupon);

    const discount = getAmount(await page.locator('.cart-discount td').innerText());
    const totalAfter = getAmount(await page.locator('.order-total td').innerText());

    expect(discount).toBeGreaterThan(0);
    expect(totalAfter).toBeLessThan(totalBefore);
  });

  test('P-16 Applied coupon can be removed', async ({ page }) => {
    await applyCoupon(page, validCoupon);

    await page.locator('.cart-discount a.woocommerce-remove-coupon').click();
    await page.waitForTimeout(4000);

    await expect(page.locator('.cart-discount')).toHaveCount(0);
  });

});

test.describe('Positive - Payment', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-17 Payment methods are displayed', async ({ page }) => {
    await expect(page.locator('ul.wc_payment_methods')).toBeVisible();
    const count = await page.locator('ul.wc_payment_methods li').count();
    expect(count).toBeGreaterThan(0);
  });

  test('P-18 User can select Credit Card payment', async ({ page }) => {
    const card = page.locator('input#payment_method_stripe');
    await card.check({ force: true });
    await page.waitForTimeout(3000);

    await expect(card).toBeChecked();
  });


  test('P-20 Checkout is successful with valid test card', async ({ page }) => {
    await page.locator('input#payment_method_stripe').check({ force: true });
    await page.waitForTimeout(3000);

    const stripe = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripe.locator('input[name="cardnumber"]').fill(validCard);
    await stripe.locator('input[name="exp-date"]').fill('12/30');
    await stripe.locator('input[name="cvc"]').fill('123');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-thankyou-order-received')).toBeVisible({ timeout: 60000 });
  });

});

test.describe('Positive - Order Summary', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-23 Subtotal is displayed correctly', async ({ page }) => {
    await expect(page.locator('.cart-subtotal')).toBeVisible();

    const subtotal = getAmount(await page.locator('.cart-subtotal td').innerText());
    expect(subtotal).toBeGreaterThan(0);
  });

  test('P-26 Shipping charges are displayed correctly', async ({ page }) => {
    await expect(page.locator('.woocommerce-shipping-totals')).toBeVisible();

    const shippingText = await page.locator('.woocommerce-shipping-totals').innerText();
    console.log('Shipping row:', shippingText);
    expect(shippingText.length).toBeGreaterThan(0);
  });

  test('P-27 Discount amount is calculated correctly', async ({ page }) => {
    const subtotal = getAmount(await page.locator('.cart-subtotal td').innerText());

    await applyCoupon(page, validCoupon);

    const discount = getAmount(await page.locator('.cart-discount td').innerText());
    expect(discount).toBeGreaterThan(0);
    expect(discount).toBeLessThanOrEqual(subtotal);
  });

  test('P-28 Tax is calculated correctly', async ({ page }) => {
    await expect(page.locator('.tax-total')).toBeVisible();

    const tax = getAmount(await page.locator('.tax-total td').innerText());
    expect(tax).toBeGreaterThanOrEqual(0);
  });

  test('P-29 Grand total is calculated correctly', async ({ page }) => {
    const subtotal = getAmount(await page.locator('.cart-subtotal td').innerText());
    const total = getAmount(await page.locator('.order-total td').innerText());

    console.log('Subtotal:', subtotal, 'Total:', total);
    expect(total).toBeGreaterThanOrEqual(subtotal);
  });

  test('P-30 Cart total matches checkout total', async ({ page }) => {
    const checkoutTotal = getAmount(await page.locator('.order-total td').innerText());

    await page.goto(cartUrl);
    const cartTotal = getAmount(await page.locator('.cart_totals .order-total td').innerText());

    expect(cartTotal).toBe(checkoutTotal);
  });

});

test.describe('Positive - Terms and Conditions', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-31 Terms and Conditions checkbox is displayed', async ({ page }) => {
    await page.locator('#terms').scrollIntoViewIfNeeded();
    await expect(page.locator('label[for="terms"]')).toBeVisible();
  });

  test('P-32 User can select the Terms and Conditions checkbox', async ({ page }) => {
    await checkTerms(page);
    await expect(page.locator('#terms')).toBeChecked();
  });

});

test.describe('Positive - Gift Option', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-33 This item is a gift checkbox is displayed', async ({ page }) => {
    await expect(page.locator('#is_gift')).toBeVisible();
  });

  test('P-34 Gift fields are displayed after selecting the checkbox', async ({ page }) => {
    await page.locator('#is_gift').check({ force: true });
    await page.waitForTimeout(3000);

    await expect(page.locator('#gift_message')).toBeVisible();
  });

  test('P-35 Gift details can be saved with valid information', async ({ page }) => {
    await page.locator('#is_gift').check({ force: true });
    await page.waitForTimeout(3000);

    await page.fill('#gift_from', 'Amaan');
    await page.fill('#gift_to', 'Sarah');
    await page.fill('#gift_message', 'Happy Birthday');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(3000);

    await expect(page.locator('.woocommerce-error')).toHaveCount(0);
  });

});

test.describe('Positive - Membership', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('P-36 Member Auto Renewal Advantage message is displayed', async ({ page }) => {
    await expect(page.getByText('Auto Renewal', { exact: false })).toBeVisible();
  });

  test('P-37 Membership discount is shown in order summary', async ({ page }) => {
    await expect(page.locator('.cart-discount')).toBeVisible();

    const discount = getAmount(await page.locator('.cart-discount td').innerText());
    expect(discount).toBeGreaterThan(0);
  });

  test('P-38 Membership pricing is displayed correctly', async ({ page }) => {
    const review = page.locator('.woocommerce-checkout-review-order-table');
    await expect(review).toBeVisible();
    await expect(review).toContainText('$');
  });

  test('P-39 Membership renewal information is displayed', async ({ page }) => {
    await expect(page.getByText('renew', { exact: false })).toBeVisible();
  });

});

test.describe('Positive - Order Placement', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
    await checkTerms(page);
  });

  test('P-43 Logged in user can place an order successfully', async ({ page }) => {
    await placeOrder(page);
    await expect(page.locator('.woocommerce-thankyou-order-received')).toBeVisible({ timeout: 60000 });
  });

  test('P-44 Order confirmation page is displayed', async ({ page }) => {
    await placeOrder(page);

    await expect(page.locator('.woocommerce-thankyou-order-received')).toBeVisible({ timeout: 60000 });
    expect(page.url()).toContain('order-received');
  });

  test('P-44 Order number is displayed on confirmation page', async ({ page }) => {
    await placeOrder(page);

    const orderNumber = await page.locator('.woocommerce-order-overview__order strong').innerText();
    console.log('Order number is:', orderNumber);
    expect(orderNumber.length).toBeGreaterThan(0);
  });

  test('P-45 Placed order appears in My Account Orders page', async ({ page }) => {
    await placeOrder(page);

    const orderNumber = await page.locator('.woocommerce-order-overview__order strong').innerText();

    await page.goto(ordersUrl);
    await expect(page.locator('.woocommerce-orders-table')).toContainText(orderNumber);
  });

});

// ==========================================================
//                  NEGATIVE TEST CASES
// ==========================================================

test.describe('Negative - Login and User', () => {

  test('N-01 Checkout is blocked for guest user when guest checkout is off', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(cartUrl);
    await page.getByText('Proceed to checkout').click();
    await page.waitForTimeout(3000);

    await expect(page.locator('#place_order')).toHaveCount(0);
  });

});

test.describe('Negative - Billing Information', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
  });

  test('N-02 Validation message shown when mandatory fields are empty', async ({ page }) => {
    await page.fill('#billing_first_name', '');
    await page.fill('#billing_last_name', '');
    await page.fill('#billing_address_1', '');
    await page.fill('#billing_city', '');
    await page.fill('#billing_email', '');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('required');
  });

  test('N-03 Validation message shown for invalid email', async ({ page }) => {
    await fillBilling(page);
    await page.fill('#billing_email', 'amaan@@invalid');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('email');
  });

  test('N-04 Validation message shown for invalid phone number', async ({ page }) => {
    await fillBilling(page);
    await page.fill('#billing_phone', 'abcd123');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

  test('N-05 Validation message shown for invalid ZIP code', async ({ page }) => {
    await fillBilling(page);
    await page.fill('#billing_postcode', 'XX!!99');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
  });

});

test.describe('Negative - Coupon', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
  });

  test('N-06 Error message shown for invalid promo code', async ({ page }) => {
    await applyCoupon(page, invalidCoupon);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.cart-discount')).toHaveCount(0);
  });

  test('N-07 Error message shown for expired promo code', async ({ page }) => {
    await applyCoupon(page, expiredCoupon);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('expired');
  });

  test('N-08 Error message shown when minimum purchase is not met', async ({ page }) => {
    await applyCoupon(page, minPurchaseCoupon);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('minimum');
  });

  test('N-09 Error message shown for already used coupon', async ({ page }) => {
    await applyCoupon(page, usedCoupon);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('usage limit');
  });

});

test.describe('Negative - Payment', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);
    await page.locator('input#payment_method_stripe').check({ force: true });
    await page.waitForTimeout(3000);
  });

  test('N-10 Validation message shown when payment details are empty', async ({ page }) => {
    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible();
  });

  test('N-11 Validation message shown for invalid card number', async ({ page }) => {
    const stripe = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripe.locator('input[name="cardnumber"]').fill(wrongCard);
    await stripe.locator('input[name="exp-date"]').fill('12/30');
    await stripe.locator('input[name="cvc"]').fill('123');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible();
  });

  test('N-12 Validation message shown for expired card', async ({ page }) => {
    const stripe = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripe.locator('input[name="cardnumber"]').fill(validCard);
    await stripe.locator('input[name="exp-date"]').fill('12/20');
    await stripe.locator('input[name="cvc"]').fill('123');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible();
  });

  test('N-13 Validation message shown for invalid CVV', async ({ page }) => {
    const stripe = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripe.locator('input[name="cardnumber"]').fill(validCard);
    await stripe.locator('input[name="exp-date"]').fill('12/30');
    await stripe.locator('input[name="cvc"]').fill('99');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible();
  });

  test('N-14 Error message shown when payment is declined', async ({ page }) => {
    const stripe = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripe.locator('input[name="cardnumber"]').fill(declinedCard);
    await stripe.locator('input[name="exp-date"]').fill('12/30');
    await stripe.locator('input[name="cvc"]').fill('123');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible({ timeout: 60000 });
    expect(page.url()).not.toContain('order-received');
  });

});

test.describe('Negative - Terms and Conditions', () => {

  test('N-15 Order cannot be placed without accepting Terms and Conditions', async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
    await fillBilling(page);

    // Do not tick the terms checkbox
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('terms');
    expect(page.url()).not.toContain('order-received');
  });

});

test.describe('Negative - Gift Option', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await addProductToCart(page);
    await openCheckout(page);
  });

  test('N-16 Validation message shown when gift details are empty and Save is clicked', async ({ page }) => {
    await fillBilling(page);

    await page.locator('#is_gift').check({ force: true });
    await page.waitForTimeout(3000);

    await page.click('button:has-text("Save")');
    await page.waitForTimeout(3000);

    await expect(page.locator('.woocommerce-error').first()).toBeVisible();
  });

  test('N-17 Validation message shown when billing is empty and gift is selected', async ({ page }) => {
    await page.locator('#is_gift').check({ force: true });
    await page.waitForTimeout(3000);

    await page.fill('#billing_first_name', '');
    await page.fill('#billing_last_name', '');
    await page.fill('#billing_email', '');

    await checkTerms(page);
    await placeOrder(page);

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(page.locator('.woocommerce-error')).toContainText('required');
  });

});