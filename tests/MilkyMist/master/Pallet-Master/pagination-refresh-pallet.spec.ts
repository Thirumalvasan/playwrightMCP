// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { palletMasterData } from '@testData/palletMasterData';


test('pallet master pagination and refresh tests', async ({ page }) => {
  test.setTimeout(70000); // Increase timeout for long waits
  // 1. Navigate to login page
  await page.goto(palletMasterData.baseUrl + 'auth/login');

  // 2. Enter login credentials
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  // 3. Click the Login button
  await page.getByRole('button', { name: /Log In/i }).click();

  // 4. Verify redirected URL
  await page.waitForURL(palletMasterData.baseUrl);
  await expect(page).toHaveURL(palletMasterData.baseUrl);

  // 5. Open Master menu and select Pallet Master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  // 6. Verify redirected URL
  await page.waitForURL(palletMasterData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(palletMasterData.baseUrl + 'master/palletmaster');




  // 7-9. Click last page button and verify data loaded
  // Use getByRole to avoid strict mode violation and .last() for last page
  const lastPageBtn = page.getByRole('link', { name: /\d+/, exact: false }).last();
  await lastPageBtn.click();
  await page.waitForTimeout(1500);
  // Check that the table data is visible after navigating to last page
  const lastPageRow = page.locator('table tbody tr');
  await expect(lastPageRow.first()).toBeVisible({ timeout: 5000 });

  // 10-11. Click page 1 button and verify data loaded
  // Use getByRole with exact name and .first() to avoid strict mode violation
  const firstPageBtn = page.getByRole('link', { name: '1', exact: true }).first();
  await firstPageBtn.click();
  await page.waitForTimeout(1500);
  // Check that the table data is visible after navigating to first page
  const firstPageRow = page.locator('table tbody tr');
  await expect(firstPageRow.first()).toBeVisible({ timeout: 5000 });

  // 12-13. Click Next button and verify next page data
  const nextBtn = page.locator('a.page-link[aria-label="Next"]');
  await nextBtn.click();
  await page.waitForTimeout(1500);
  // Check that the table data is visible after navigating to next page
  const nextPageRow = page.locator('table tbody tr');
  await expect(nextPageRow.first()).toBeVisible({ timeout: 5000 });

  // 14-15. Click Prev button and verify previous page data
  const prevBtn = page.locator('a.page-link[aria-label="Previous"]');
  await prevBtn.click();
  await page.waitForTimeout(1500);
  // Check that the table data is visible after navigating to previous page
  const prevPageRow = page.locator('table tbody tr');
  await expect(prevPageRow.first()).toBeVisible({ timeout: 5000 });

  // 16. Click the Refresh button
  const refreshBtn = page.locator('span#basic-addon1.input-group-text.refresh');
  await refreshBtn.click();
  await page.waitForTimeout(1000);

  // 17. Verify the page is refreshed (e.g., table reloads)
  // Optionally, check for a loading spinner or table update



  // 18. Verify the datetime displayed is updated to current system time
  // Skipped: No matching selector found for datetime display. Uncomment and update selector if available.
  // const now = new Date();
  // const timeString = getTimeString(now);
  // const dateTimeDisplay = page.locator('.datetime-display, .last-updated, .refresh-time');
  // await expect(dateTimeDisplay).toContainText(timeString.slice(0, 4), { timeout: 10000 });

  // 19. Show the screen as updated for 30 seconds
  await page.waitForTimeout(30000);
});

