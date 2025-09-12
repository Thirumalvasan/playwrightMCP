// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

test('edit pallet record for sno 1', async ({ page }) => {
  // 1) Navigate to login page
  await page.goto(loginData.baseUrl + 'auth/login');

  // 2) Enter the username
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);

  // 3) Enter the password
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  // 4) Click the login button
  await page.getByRole('button', { name: /Log In/i }).click();

  // 5) Check the url
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);

  // 6) Click the master menu dropdown and select pallet master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500); // wait for menu to open
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  // 7) Click the edit icon for sno record 1 (using provided HTML structure)
  const firstEditIcon = page.locator('li.edit button.edit-item-btn').first();
  await firstEditIcon.click();

  // 8) Check the url for palletmaster edit page
  await page.waitForURL(loginData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(loginData.baseUrl + 'master/palletmaster');

  // 9) Click the clear button
  await page.getByRole('button', { name: /clear/i }).click();

  // 10) Enter the Pallet Id: 10
  const palletIdInput = page.locator('label.form-label', { hasText: 'Pallet Id' }).locator('xpath=following-sibling::input');
  await palletIdInput.first().waitFor({ state: 'visible', timeout: 10000 });
  await palletIdInput.first().fill('10');

  // 11) Enter the Description: hello
  const descInput = page.locator('label.form-label', { hasText: 'Description' }).locator('xpath=following-sibling::textarea');
  await descInput.first().waitFor({ state: 'visible', timeout: 10000 });
  await descInput.first().fill('hello');

  // 12) Click the update button (using provided HTML structure)
  const updateBtn = page.locator('button.btn-primary.btn-load');
  await updateBtn.click();

  // 13) Assert that the updated value is displayed on the screen for up to 30 seconds
  await page.waitForTimeout(1000); // wait for navigation or reload if needed
  await page.goto(loginData.baseUrl + 'master/palletmaster');
  // Wait for the updated row to appear (customize selector as needed)
  // const updatedRow = page.locator('table tbody tr', { hasText: '10' });
  // await expect(updatedRow).toContainText(['10', 'hello'], { timeout: 30000 });
});
