const { test, expect } = require('@playwright/test');
// ---------------- HOMEPAGE ----------------
const BASE_URL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('.f-button.is-close-btn').click().catch(() => {}); // Close the popup if it appears
});

test('Verify that the Header will be present on top', async ({ page }) => {
    await expect(page.locator('#masthead')).toBeVisible();
});

test('Verify whether the Header brand logo will be present on top of the homepage or not', async ({ page }) => {
    await expect(page.locator('.site-branding').first()).toBeVisible();
});

test('Verify whether the search icon will be present or not', async ({ page }) => {
    await expect(page.locator('.header-search-link').first()).toBeVisible();
});

test('Verify whether the search icon working or not', async ({ page }) => {
    await page.locator('.header-search-link').first().click();

    const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');
    await searchInput.fill('sewing');
    await searchInput.press('Enter');
});

test('Verify that close button will click and present on search panel', async ({ page }) => {
    await page.locator('.header-search-link').first().click();
    await expect(page.locator('.close-search')).toBeVisible();
    await page.locator('.close-search').click();
    await expect(page.locator('.container').nth(2)).toBeHidden();
});

test('Verify that the cart icon displayed on the header', async ({ page }) => {
    await expect(page.locator('.bb-icon-shopping-cart').first()).toBeVisible();
});

test('Verify whether the cart icon will be clicked or not', async ({ page }) => {
    await page.locator('.bb-icon-shopping-cart').first().click();
    await expect(page.locator('.notification-dropdown').first()).toBeVisible();
});

// test('Verify that when click on cart, cart will display products if products present on cart', async ({ page }) => {

//     // Precondition:
//     // Product should already exist in cart.
//     await page.getByRole('link', { name: 'Shop', exact: true }).click();
//     await page.waitForLoadState('domcontentloaded');

//     const addToCartButton = page.locator('a[href*="add-to-cart"]').first();
//     await expect(addToCartButton).toBeVisible();
//     await addToCartButton.click();

//     const cartLink = page.locator('a.header-cart-link.notification-link').first();
//     await expect(cartLink).toBeVisible();
//     await cartLink.click();

//     const dropdown = page.locator('.notification-dropdown').filter({ has: page.locator('li.mini_cart_item:visible') }).first();
//     await expect(dropdown).toBeVisible();
//     await expect(dropdown.locator('.notification-header')).toContainText('Shopping Cart');
//     await expect(dropdown.locator('.header-mini-cart')).toBeVisible();
//     await expect(dropdown.locator('.header-view-cart-link:visible')).toBeVisible();

//     const product = dropdown.locator('li.mini_cart_item:visible').first();
//     await expect(product).toBeVisible();
//     await expect(product).not.toBeEmpty();

//     const productName = (await product.textContent()).trim();
//     console.log(`Mini cart product text: ${productName}`);
//     await expect(productName.length).toBeGreaterThan(0);
// });

test('Verify that when the cart is empty, the cart will display Shopping Cart and No products in the cart message', async ({ page }) => {
    // Precondition:
    // Cart should be empty.
    await page.locator('.bb-icon-shopping-cart').first().click();
    await expect(page.locator('.notification-header').first()).toContainText('Shopping Cart');
    await expect(page.locator('.header-mini-cart').first()).toContainText('No products in the cart');
});

test('Verify that the Newsletter link will be present', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Newsletter' })).toBeVisible();
});

test('Verify that the Newsletter link will click', async ({ page }) => {
    await page.getByRole('link', { name: 'Newsletter' }).click();
    await expect(page).toHaveURL(/newsletter/i);
    await expect(page.getByText('Sign up for our newsletter to see it all!')).toBeVisible();
});

test('Verify that Login / Register will be present on the header', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Login / Register' })).toBeVisible();
});

test('Verify that the Login / Register link will be redirected to My Account page', async ({ page }) => {
    await page.getByRole('link', { name: 'Login / Register' }).click();
    await expect(page).toHaveURL(/my-account/i);
    await expect(page.getByRole('heading', { name: 'Register For A Free Account' })).toBeVisible();
});

test('Verify that Become a Member button will be present on header', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Become a Member' })).toBeVisible();
});

test('Verify that Become a Member button color will be display #f46c63 and text in white', async ({ page }) => {

    const button = page.getByRole('link', { name: 'Become a Member' });

    await expect(button).toHaveCSS('background-color', 'rgb(244, 108, 99)');
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('Verify that when mouse hover on Become a Member button color will be white and text color #f46c63', async ({ page }) => {

    const button = page.getByRole('link', { name: 'Become a Member' });
    await button.hover();

    await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(button).toHaveCSS('color', 'rgb(244, 108, 99)');
});

test('Verify when click on Become a Member button it is redirected to the correct page', async ({ page }) => {

    await page.getByRole('link', { name: 'Become a Member' }).click();
    await expect(page).toHaveURL("https://stage.sewdaily.com/");
});

test('Verify whether navigation bars will be present on the header or not', async ({ page }) => {

    const menus = [
        'Members Only',
        'Sewing',
        'Embroidery',
        'Workshops & Videos',
        'Patterns',
        'Shop',
        'On Sale'
    ];

    for (const menu of menus) {
        await expect(page.locator('#primary-navbar')).toBeVisible();
    }
});

test('Verify top navigation links return 200 status code', async ({ page, request }) => {

    const topLinks = page.locator('#primary-navbar > ul > li > a');

    const count = await topLinks.count();

    for (let i = 0; i < count; i++) {

        const href = await topLinks.nth(i).getAttribute('href');

        if (!href) continue;

        const url = new URL(href, BASE_URL).toString();

        const response = await request.get(url);

        expect(response.status(), url).toBe(200);
    }
});
test('Verify Pencil banner is visible and navigation bar remain fixed while scrolling', async ({ page }) => {
   
    const header = page.locator('#masthead');
    const pencilBanner = page.locator('.sale-banner').nth(1);
    // Verify header is visible before scrolling
    await expect(header).toBeVisible();
    await expect(pencilBanner).toBeVisible();

    // Scroll down the page
    await page.evaluate(() => {
    window.scrollTo({
        top: 1500,
        behavior: 'smooth'
    });
});

await page.waitForTimeout(3000);

    // Wait for scroll to complete
    await page.waitForTimeout(5500);

    // Header should still be visible
    await expect(header).toBeVisible();

    // Verify CSS position
    const position = await header.evaluate(el =>
        window.getComputedStyle(el).position
    );

    expect(['fixed', 'sticky']).toContain(position);

    // Verify header is still at the top of the viewport
    const box = await header.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
        expect(box.y).toBeLessThanOrEqual(0);
    }
});