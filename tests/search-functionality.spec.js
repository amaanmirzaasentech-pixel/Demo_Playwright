import { test, expect } from '@playwright/test';

const baseURL = 'https://sewdailystg:e9554e0c@stage.sewdaily.com';

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
        await page.locator('.f-button.is-close-btn').click().catch(() => {}); // Close the popup if it appears
    });

    test('Verify Search popup opens successfully', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });

        await expect(searchIcon).toBeVisible();
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');
        await expect(searchInput).toBeVisible();
    });

    test('Verify Ask Sew Daily search input is visible and focused', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeFocused();
    });

    test('Verify user can search with a valid keyword', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('h2, h3').filter({ hasText: 'Test' })).toBeVisible();
    });

    test('Verify AI response heading is displayed', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('h2, h3').filter({ hasText: 'Test' })).toBeVisible();
    });

    test('Verify AI summary text is displayed', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Testing plays')).toBeVisible();
    });

    test('Verify Results section is displayed', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();

        const results = page.locator('[class*=result], article');

        await expect(results.first()).toBeVisible();
        expect(await results.count()).toBeGreaterThan(0);
    });

    test('Verify follow-up textbox is displayed', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        const followUp = page.locator('textarea[placeholder*="Ask a follow-up..."]');

        await expect(followUp).toBeVisible();
    });

    test('Verify user can perform a follow-up search', async ({ page }) => {
        const searchIcon = page.getByRole('link', { name: 'Search the Site' });
        await searchIcon.click();

        const searchInput = page.locator('input[placeholder*="Ask Sew Daily"]');

        await searchInput.fill('Test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        const followUp = page.locator('textarea[placeholder*="Ask a follow-up..."]');

        await expect(followUp).toBeVisible();

        await followUp.fill('embroidery');
        await followUp.press('Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('heading', { name: 'embroidery', exact: true })).toBeVisible();
    });

