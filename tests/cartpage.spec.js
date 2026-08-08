const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';
const CART_URL = `${BASE_URL}/cart/`;
const SHOP_URL = `${BASE_URL}/shop/`;

// A product known to exist on the shop page (adjust product_id as needed per env)
const TEST_PRODUCT_ID = '10663318';
const VALID_COUPON = 'NICKTEST';        // replace with a real, active coupon on stage
const INVALID_COUPON = 'NOT_A_REAL_CODE';

function isCartEmpty(page) {
  return page.getByText('Your cart is currently empty').isVisible().catch(() => false);
}
async function safeGoto(page, url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Ensures the cart has at least one item by adding TEST_PRODUCT_ID from the shop
 * page if the cart is currently empty. Leaves the browser on the cart page.
 */
async function ensureCartHasItem(page) {
 await safeGoto(page, SHOP_URL);
    const addToCart = page.locator(
      `a.add_to_cart_button[data-product_id="${TEST_PRODUCT_ID}"]`
    );
    ;
    await addToCart.click();

    // Cart icon badge should reflect at least 1 item
    const cartCount = page.locator('.bb-icon-l bb-icon-shopping-cart, .count');
    await expect(cartCount.first()).toBeVisible({ timeout: 15000 });

    await safeGoto(page, CART_URL);
    await expect(page.locator('table.shop_table tr.cart_item, .woocommerce-cart-form__cart-item')).toHaveCount(1);
  };


// ---------- Tests ----------

  test('Verify that the Cart page is accessible', async ({ page }) => {
    await safeGoto(page, CART_URL);
    await expect(page).toHaveURL(/\/cart\//);
    // Either the empty-cart state or the cart table should render — page must not error out
    const emptyVisible = await page.getByText('Your cart is currently empty').isVisible().catch(() => false);
    const tableVisible = await page.locator('table.shop_table, .woocommerce-cart-form').isVisible().catch(() => false);
    expect(emptyVisible || tableVisible).toBeTruthy();
  });

  test('Verify that a media item can be added to the cart', async ({ page }) => {
    await safeGoto(page, SHOP_URL);
    const addToCart = page.locator(
      `a.add_to_cart_button[data-product_id="${TEST_PRODUCT_ID}"]`
    );
    await addToCart.scrollIntoViewIfNeeded();
    await addToCart.click();

    // Cart icon badge should reflect at least 1 item
    const cartCount = page.locator('.bb-icon-l bb-icon-shopping-cart, .count');
    await expect(cartCount.first()).toBeVisible({ timeout: 15000 });

    await safeGoto(page, CART_URL);
    await expect(page.locator('table.shop_table tr.cart_item, .woocommerce-cart-form__cart-item')).toHaveCount(1);
  });

 test('Verify product details on Cart page', async ({ page }) => {
    await ensureCartHasItem(page);
  // Verify Product Thumbnail
  const productThumbnail = page.locator('td.product-thumbnail img');
  await expect(productThumbnail.first()).toBeVisible();

  // Verify Product Name
  const productName = page.locator('td.product-name a');
  await expect(productName.first()).toBeVisible();
  await expect(productName.first()).not.toHaveText('');

  // Verify Product Price
  const productPrice = page.getByRole('cell', { name: '$' }).first()
  await expect(productPrice).toBeVisible();
  await expect(productPrice).not.toHaveText('');

  // Verify Product Quantity
  const productQuantity = page.getByRole('cell', { name: 'Sip and Stitch: Manhattan Cocktail Embroidery Design Download quantity - 1 +' });
  await expect(productQuantity).toBeVisible();

  // Verify Product Subtotal
  const productSubtotal = page.locator('.cart-subtotal');
  await expect(productSubtotal).toBeVisible();

  // Verify Cart Total
  const total = page.locator('tr.order-total');
  await expect(total).toBeVisible();

}); 

  test('Verify that the user can update the quantity of an item in the cart', async ({ page }) => {
    await ensureCartHasItem(page);

    const qtyInput = page.locator('table.shop_table input.qty, .woocommerce-cart-form input.qty').first();
    const subtotalBefore = page.locator('.product-subtotal > .woocommerce-Price-amount > bdi, td.product-subtotal .woocommerce-Price-amount > bdi').first();
    const subtotalBeforeText = (await subtotalBefore.textContent()).trim();

    await qtyInput.fill('2');
    await qtyInput.blur();
    await expect(qtyInput).toHaveValue('2');

    const updateBtn = page.getByRole('button', { name: /update cart/i }).first();
    await expect(updateBtn).toBeVisible();
    await updateBtn.click({ timeout: 30000 });

    await expect(qtyInput).toHaveValue('2');

    const subtotalAfter = page.locator('.product-subtotal > .woocommerce-Price-amount > bdi, td.product-subtotal .woocommerce-Price-amount > bdi').first();
    await expect(subtotalAfter).not.toHaveText(subtotalBeforeText);
    await expect(page.locator('.woocommerce-message')).toHaveText(/cart updated\./i, { timeout: 10000 });
  });

  test('Verify that the user can remove an item from the cart', async ({ page }) => {
    await ensureCartHasItem(page);

    const firstRow = page.locator('table.shop_table tr.cart_item, .woocommerce-cart-form__cart-item').first();
    const removeLink = firstRow.locator('a.remove, [aria-label*="Remove"]');
    await removeLink.click();

    await expect(page.getByText(/removed\./i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /undo\??/i })).toBeVisible();
    await expect(page.locator(".woocommerce-message")).toHaveText(/removed\./i, { timeout: 10000 });
  });

  test('Verify that removing an item that has already been Undo can be handled properly', async ({ page }) => {
    await ensureCartHasItem(page);

   const firstRow = page.locator('table.shop_table tr.cart_item, .woocommerce-cart-form__cart-item').first();
    const removeLink = firstRow.locator('a.remove, [aria-label*="Remove"]');
    await removeLink.click();

    await expect(page.getByText(/removed\./i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /undo\??/i })).toBeVisible();

    const undoLink = page.getByRole('link', { name: /undo\??/i });
    await expect(undoLink).toBeVisible({ timeout: 10000 });
    await undoLink.click();
    await expect(
      page.locator('td.product-name a').first()).toBeVisible({ timeout: 10000 });
  });

  test('Verify that a valid coupon code is applied correctly', async ({ page }) => {
    await ensureCartHasItem(page);

    await page.getByRole('link', { name: 'Click here to enter your' }).click({ force: true }); // expands field on some themes
    const couponInput = page.locator('#coupon_code');
    await couponInput.fill(VALID_COUPON);
    await page.getByRole('button', { name: /apply coupon/i }).click();

    await expect(
      page.getByText(/coupon code applied successfully/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('Verify that applying an invalid promo code can be handled properly', async ({ page }) => {
    await ensureCartHasItem(page);

     await page.getByRole('link', { name: 'Click here to enter your' }).click({ force: true });;
    const couponInput = page.locator('#coupon_code');
    await couponInput.fill(INVALID_COUPON);
    await page.getByRole('button', { name: /apply coupon/i }).click();

    await expect(
      page.getByText(/Coupon "not_a_real_code" cannot be applied because it does not exist./i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('Verify that the user can proceed to the checkout page from the cart', async ({ page }) => {
    await ensureCartHasItem(page);

    const checkoutBtn = page.getByRole('link', { name: /proceed to checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    await expect(page).toHaveURL(/\/checkout\//, { timeout: 15000 });
  });

  test('Verify that navigating with an empty cart can be handled properly', async ({ page }) => {
    await safeGoto(page, CART_URL);

    // Remove any existing items first so the cart is guaranteed empty
    let removeLink = page.locator('a.remove, [aria-label*="Remove"]').first();
    while (await removeLink.isVisible().catch(() => false)) {
      await removeLink.click();
      await page.waitForTimeout(1000);
      removeLink = page.locator('a.remove, [aria-label*="Remove"]').first();
    }

    await expect(page.getByText('Your cart is currently empty')).toBeVisible({ timeout: 10000 });
    const returnToShop = page.getByRole('link', { name: /return to shop/i });
    await expect(returnToShop).toBeVisible();

    await returnToShop.click();
    await expect(page).toHaveURL(/\/shop\//, { timeout: 15000 });
    const shopHeading = page.locator('h1.woocommerce-products-header__title.page-title');
    await expect(shopHeading).toBeVisible({ timeout: 15000 });
    console.log(await shopHeading.textContent());
  });

test('Verify automatic discount banner if active', async ({ page }) => {
    await safeGoto(page, BASE_URL);
    await page.locator('.f-button.is-close-btn').click().catch(() => {}); // Close the popup if it appears
    await page.locator('#menu-item-10649901').hover();
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.getByRole('link', { name: 'Magazines' }).click(),
    ]);
     const addToCart1 = page.locator(
      `a.add_to_cart_button[data-product_id="10650696"]`
    );
     await addToCart1.click();
     const addToCart2 = page.locator(
      `a.add_to_cart_button[data-product_id="10650692"]`
    );
     await addToCart2.click();
     await safeGoto(page, CART_URL);
  // WooCommerce discount / notice banner
  const discountBanner = page.locator('.woocommerce-message');
  // Check if banner exists and is visible
  if (await discountBanner.count() > 0 && await discountBanner.first().isVisible()) {
 
    // Get dynamic banner text
    const bannerText = (await discountBanner.first().textContent())?.trim();

    // Print in terminal / Playwright console
    console.log(`Discount banner displayed: ${bannerText}`);

    // Optional validation: ensure banner has some text
    expect(bannerText).not.toBe('');

  } else {

    // No discount rule active
    console.log('No automatic discount banner displayed on the cart page.');

  }
});
