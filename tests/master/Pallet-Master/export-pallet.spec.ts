// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

test('pallet master export PDF, Excel, CSV', async ({ page }) => {
  test.setTimeout(70000); // Allow for 1 min display
  // 1) Navigate to login page
  await page.goto(palletMasterData.baseUrl + 'auth/login');

  // 2) Enter the username
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);

  // 3) Enter the password
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  // 4) Click the login button
  await page.getByRole('button', { name: /Log In/i }).click();

  // 5) Check the url
  await page.waitForURL(palletMasterData.baseUrl);
  await expect(page).toHaveURL(palletMasterData.baseUrl);

  // 6) Click the master menu dropdown and select pallet master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  // 7) Check the url for palletmaster list page
  await page.waitForURL(palletMasterData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(palletMasterData.baseUrl + 'master/palletmaster');

  // 8) Click the export button
  const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
  await exportBtn.click();
  await page.waitForTimeout(500);

  // 9) Click the PDF option
  const pdfBtn = page.locator('a.dropdown-item', { hasText: 'PDF' });
  await pdfBtn.click();
  await page.waitForTimeout(1000);

  // 10) Click the export button again for Excel
  await exportBtn.click();
  await page.waitForTimeout(500);
  const excelBtn = page.locator('a.dropdown-item', { hasText: 'EXCEL' });
  await excelBtn.click();
  await page.waitForTimeout(1000);

  // 11) Click the export button again for CSV
  await exportBtn.click();
  await page.waitForTimeout(500);
  const csvBtn = page.locator('a.dropdown-item', { hasText: 'CSV' });
  await csvBtn.click();
  await page.waitForTimeout(1000);

  // 12) Show the screen for 1 minute
  await page.waitForTimeout(40000);
});
