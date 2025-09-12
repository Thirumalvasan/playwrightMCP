// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

test('toggle pallet record for sno 1 and verify update', async ({ page }) => {
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

  // 8) Click the toggle icon for sno record 1 (first .code-switcher input)
  const firstToggle = page.locator('input.code-switcher').first();
  const wasChecked = await firstToggle.isChecked();
  await firstToggle.click();

  // 9) Check the confirmation pop-up appears
  const confirmPopup = page.locator('div.swal2-popup.swal2-modal.swal2-icon-warning');
  await expect(confirmPopup).toBeVisible({ timeout: 5000 });
  await expect(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to (Deactivate|Activate) it\?/i);

  // 10) Click the "Yes, (De)Activate it!" button
  const yesBtn = confirmPopup.locator('button.swal2-confirm');
  await yesBtn.click();

  // 11) After, check the screen that the toggle action is updated
  await page.waitForTimeout(1000);
  const isChecked = await firstToggle.isChecked();
  expect(isChecked).not.toBe(wasChecked);

  // 12) Show the screen for 1 minute
  await page.waitForTimeout(60000);
});
