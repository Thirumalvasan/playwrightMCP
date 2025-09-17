import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';
import { queryDb } from '../../../Database/db';

// Generate random description
function randomDescription() {
  const words = ['auto', 'test', 'pallet', 'entry', 'desc', 'random', 'playwright', 'mcp', 'data', 'insert'];
  return Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

test('add multiple pallets in Pallet Master and validate DB insert', async ({ page }) => {
  // 1) Navigate to login page
  await page.goto(loginData.baseUrl + 'auth/login');

  // 2) Enter the username
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);

  // 3) Enter the password
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  // 4) Click the login button
  await page.getByRole('button', { name: /Log In/i }).click();

  // 5) Verify login success
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);

  // 6) Navigate to Pallet Master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  for (let i = 0; i < palletMasterData.palletIdCount; i++) {
    // 1) Click Add button
    await page.getByRole('button', { name: new RegExp(palletMasterData.addButton, 'i') }).click();

    // 2) Check the url
    await page.waitForURL(loginData.baseUrl + 'master/palletmaster');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/palletmaster');

    // 3) Pallet Id
    const palletId = `${palletMasterData.palletIdPrefix}${palletMasterData.palletIdStart + i}`;
    const palletIdInput = page.locator('label.form-label', { hasText: palletMasterData.palletIdLabel }).locator('xpath=following-sibling::input');
    await palletIdInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await palletIdInput.first().fill(palletId);

    // 4) Description
    const descInput = page.locator('label.form-label', { hasText: palletMasterData.descriptionLabel }).locator('xpath=following-sibling::textarea');
    await descInput.first().waitFor({ state: 'visible', timeout: 10000 });
    const description = randomDescription();
    await descInput.first().fill(description);

    // 5) Submit
    await page.getByRole('button', { name: new RegExp(palletMasterData.submitButton, 'i') }).click();

    // 6) Handle duplicate pop-up
    let handledPopup = false;
    try {
      const errorPopup = page.locator(`div.modal-body:has-text("${palletMasterData.errorPopupText}")`);
      await errorPopup.waitFor({ state: 'visible', timeout: 3000 });

      const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
      if (await okBtn.isVisible()) {
        await okBtn.click();
        handledPopup = true;
        console.log(`❌ Pallet ID ${palletId} already exists. Skipping DB check.`);
      }
      await page.waitForTimeout(1000);
    } catch {
      await page.waitForTimeout(1000);
    }

    // 7) Verify backend DB only if not duplicate
    if (!handledPopup) {
      const rows = await queryDb(
        `SELECT TOP 1 PalletId, Description 
         FROM Pallet_Master 
         WHERE PalletId = '${palletId}' 
         ORDER BY CreatedDate DESC`
      );

      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].PalletId).toBe(palletId);
      console.log(`✅ Pallet ID ${palletId} inserted successfully in DB.`);
    }

    // 8) Reset back to list
    await page.goto(loginData.baseUrl + 'master/palletmaster');
    await page.waitForTimeout(500);
  }
}, 120000);
