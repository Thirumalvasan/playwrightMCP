// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

// This test assumes the import process is triggered by a button and a file upload
// and that a success message is shown after import.
test('import pallet and verify', async ({ page }) => {
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
  await page.waitForTimeout(500); // wait for menu to open
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  // 7) Check the url for palletmaster list page
  await page.waitForURL(palletMasterData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(palletMasterData.baseUrl + 'master/palletmaster');

  // 8) Click the import button
  await page.getByRole('button', { name: /Import/i }).click();

  // 9) Upload the sample file
  const filePath = palletMasterData.sampleFile;
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByLabel('Choose File').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);

  // 10) Click the upload button
  await page.getByRole('button', { name: /Upload/i }).click();

  // 11) Wait for the import success message
  const successMsg = page.locator('.swal2-popup .swal2-title');
  await expect(successMsg).toHaveText(/Success/i, { timeout: 10000 });

  // 12) Dismiss the success popup
  await page.getByRole('button', { name: /OK/i }).click();

  // 13) Optionally, verify imported data in the table (if possible)
  // ...
});
