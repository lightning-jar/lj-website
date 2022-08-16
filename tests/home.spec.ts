import { expect, test, type Page } from '@playwright/test';


// home page tests

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});



// Test: meta charset
test('index page has expected charset meta tag', async ({ page }) => {

  const charset = await page.locator('meta[charset]')

	// Expect charset to contain proper value
  await expect(charset).toHaveAttribute('charset', 'utf-8')

});

// Test: Favicons
test('index page has expected favicons', async ({ page }) => {

  // svg icon
  const svgIcon = await page.locator('link[rel="icon"][type="image/svg+xml"]')

    // Expect favicon to have proper type
    await expect(svgIcon).toHaveAttribute('type', 'image/svg+xml');

    // Expect favicon to have proper as
    await expect(svgIcon).toHaveAttribute('as', 'image');

    // Expect favicon to have correct url
    await expect(svgIcon).toHaveAttribute('href', /.*lj-favicon/);

  // png icon
  const pngIcon = await page.locator('link[rel="icon"][type="image/png"]')

    // Expect favicon to have proper type
    await expect(pngIcon).toHaveAttribute('type', 'image/png')

    // Expect favicon to have proper 'sizes'
    await expect(pngIcon).toHaveAttribute('sizes', '32x32')

    // Expect favicon to have correct url
    await expect(pngIcon).toHaveAttribute('href', /.*lj-favicon-32x32\.png/);

});

// Test: title tag
test('index page has expected title tag', async ({ page }) => {

	// Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lightning Jar | Digital Studio/);

});
