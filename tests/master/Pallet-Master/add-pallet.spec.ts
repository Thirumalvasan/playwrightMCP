import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

function randomDescription() {
  const words = ['auto', 'test', 'pallet', 'entry', 'desc', 'random', 'playwright', 'mcp', 'data', 'insert'];
  return Array.from({length: 3}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}
// @ts-ignore
test('add multiple pallets in Pallet Master and handle duplicates', async ({ page }) => {
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

  // 6) Click the master menu dropdown and select palletmaster
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500); // wait for menu to open
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  for (let i = 0; i < palletMasterData.palletIdCount; i++) {
    // 1) Click the Add button
    await page.getByRole('button', { name: new RegExp(palletMasterData.addButton, 'i') }).click();

    // 2) Check the url for palletmaster add page
    await page.waitForURL(loginData.baseUrl + 'master/palletmaster');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/palletmaster');

    // 3) Enter the Pallet Id
    const palletId = `${palletMasterData.palletIdPrefix}${palletMasterData.palletIdStart + i}`;
    const palletIdInput = page.locator('label.form-label', { hasText: palletMasterData.palletIdLabel }).locator('xpath=following-sibling::input');
    await palletIdInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await palletIdInput.first().fill(palletId);

    // 4) Enter the Description
    const descInput = page.locator('label.form-label', { hasText: palletMasterData.descriptionLabel }).locator('xpath=following-sibling::textarea');
    await descInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await descInput.first().fill(randomDescription());

    // 5) Click submit button
    await page.getByRole('button', { name: new RegExp(palletMasterData.submitButton, 'i') }).click();

    // 6) If error pop-up appears, click OK and continue
    let handledPopup = false;
    try {
      // Wait for the error pop-up with the specific text
      const errorPopup = page.locator(`div.modal-body:has-text("${palletMasterData.errorPopupText}")`);
      await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
      // Click the OK button in the pop-up
      const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
      if (await okBtn.isVisible()) {
        await okBtn.click();
        handledPopup = true;
        console.log(`Pallet ID ${palletId} already exists. Closed alert and continuing.`);
      }
      await page.waitForTimeout(1000);
    } catch (e) {
      // No error pop-up appeared, assume success
      await page.waitForTimeout(1000);
    }

    // 7) Always reload/navigate back to the Pallet Master list to reset dialog state
    await page.goto(loginData.baseUrl + 'master/palletmaster');
    await page.waitForTimeout(500);
    // Then click Add again in the next loop
    if (!handledPopup) {
      console.log(`Pallet ID ${palletId} added successfully.`);
    }
  }
}, 90000);
