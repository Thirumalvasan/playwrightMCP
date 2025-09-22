import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';


test('import pallet file and verify import', async ({ page }) => {

  await page.goto(palletMasterData.baseUrl + 'auth/login');

  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);

  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  await page.getByRole('button', { name: /Log In/i }).click();

  await page.waitForURL(palletMasterData.baseUrl);
  await expect(page).toHaveURL(palletMasterData.baseUrl);

  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500); // wait for menu to open
  await page.getByRole('link', { name: /Pallet Master/i }).click();


  await page.waitForURL(palletMasterData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(palletMasterData.baseUrl + 'master/palletmaster');

  await page.getByRole('button', { name: /Import/i }).click();

  const filePath = palletMasterData.sampleFile;
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  const verifyBtn = page.getByRole('button', { name: /Verify & Confirm/i });
  await verifyBtn.waitFor({ state: 'visible', timeout: 10000 });
  await verifyBtn.click();

  const successMsg = page.locator('.swal2-popup .swal2-title');
  await expect(successMsg).toHaveText(/Success/i, { timeout: 10000 });

  await page.getByRole('button', { name: /OK/i }).click();

});
