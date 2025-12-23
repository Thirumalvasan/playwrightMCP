import { test, expect } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { palletMasterData } from '@testData/palletMasterData';
import { queryDb } from '@database/db';
import '../../../setup';

// Generate random description
function randomDescription() {
  const words = [
    'auto', 'test', 'pallet', 'entry', 'desc', 'random',
    'playwright', 'mcp', 'data', 'insert'
  ];
  return Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

//test('add multiple pallets in Pallet Master and validate DB insert', async ({ page }) => {

test('add multiple pallets in Pallet Master and validate DB insert', async ({ page }) => {
  test.setTimeout(60000); // Increase timeout to 60 seconds
  // Login
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);

  // Navigate to Pallet Master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  for (let i = 0; i < palletMasterData.palletIdCount; i++) {
    // Click Add button
    await page.getByRole('button', { name: new RegExp(palletMasterData.addButton, 'i') }).click();

    // Wait for navigation and verify URL
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/palletmaster');

    // Fill PalletId input
    const palletId = `${palletMasterData.palletIdPrefix}${palletMasterData.palletIdStart + i}`;
    const palletIdInput = page.locator('label.form-label', { hasText: palletMasterData.palletIdLabel }).locator('xpath=following-sibling::input');
    await palletIdInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await palletIdInput.first().fill(palletId);

    // Fill Description
    const descInput = page.locator('label.form-label', { hasText: palletMasterData.descriptionLabel }).locator('xpath=following-sibling::textarea');
    await descInput.first().waitFor({ state: 'visible', timeout: 10000 });
    const description = randomDescription();
    await descInput.first().fill(description);

    // Click Submit
    await page.getByRole('button', { name: new RegExp(palletMasterData.submitButton, 'i') }).click();

    let handledPopup = false;

    // Check for duplicate pallet popup within 3 seconds
    try {
      const errorPopup = page.locator(`div.modal-body:has-text("${palletMasterData.errorPopupText}")`);
      await errorPopup.waitFor({ state: 'visible', timeout: 3000 });

      // Duplicate popup appeared - click OK and skip DB check
      const okBtn = errorPopup.getByRole('button', { name: /^ok$/i });
      if (await okBtn.isVisible()) {
        await okBtn.click();
        handledPopup = true;
        await expect(errorPopup).toBeHidden({ timeout: 3000 });
        console.log(`âŒ Pallet ID ${palletId} already exists. Skipping DB check.`);
      } else {
        console.log('âš ï¸ Duplicate popup OK button not found. Will attempt DB check.');
      }

      await page.waitForTimeout(1000);
    } catch {
      // No duplicate popup detected
      console.log(`âœ”ï¸ Duplicate popup not found for Pallet ID ${palletId}. Will check DB.`);
    }

    if (!handledPopup) {
      // Retry DB check up to 4 times in case of slight delay
      let foundInDb = false;
      let attempts = 0;
      let rows: any[] = [];

      while (!foundInDb && attempts < 4) {
        try {
          rows = await queryDb(
            `SELECT TOP 1 PalletId, Description 
             FROM Master_Pallet 
             WHERE PalletId = '${palletId}' 
             ORDER BY UpdateDateTime DESC`
          );
        } catch (error) {
          console.error(`[ERROR] DB query failed on attempt ${attempts + 1}:`, error);
          rows = [];
        }

        foundInDb = rows && rows.length > 0;
        console.log(`[DEBUG] DB check attempt ${attempts + 1} - found rows: ${rows ? rows.length : 0}`);

        if (!foundInDb) {
          await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds before retrying
        }
        attempts++;
      }

      expect(foundInDb).toBe(true);
      if (foundInDb && rows && rows.length > 0) {
        expect(rows[0].PalletId).toBe(palletId);
        console.log(`âœ… Pallet ID ${palletId} inserted successfully into DB.`);
      } else {
        console.error(`âŒ Pallet ID ${palletId} NOT found in DB after submit.`);
      }
    }

    // Reload Pallet Master list page for the next iteration
    await page.goto(loginData.baseUrl + 'master/palletmaster');
    await page.waitForTimeout(500);
  }
});

