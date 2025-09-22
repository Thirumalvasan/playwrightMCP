import { test, expect } from '@playwright/test';
import { loginData } from '../../../../testData/loginData';
import { itemGroupData } from '../../../../testData/ItemGroupData';
import { queryDb } from '../../../../Database/db';


test('Add multiple Item Groups and verify record count', async ({ page }) => {
  // 1. Login and navigate to Item Group page (do this once)
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Item Group/i }).click();
  await page.waitForURL(/itemgroup/i);
  await expect(page).toHaveURL(/itemgroup/i);

  // 2. Loop through the data arrays and add each record
  const names = itemGroupData.itemgroupname;
  const descs = itemGroupData.itemGroupdesc;
 // const count = Math.min(names.length, descs.length, 3); // Add up to 3 records
  for (let i = 0; i < itemGroupData.itemgroupcount; i++) {
    let added = false;
    let attempts = 0;
    while (!added && attempts < 1) {
      // Click Add button
      await page.getByRole('button', { name: new RegExp(itemGroupData.addButton, 'i') }).click();
      await page.waitForURL(/itemgroup/i);
      await expect(page).toHaveURL(/itemgroup/i);
      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      // Fill fields
      const allTextboxes = page.locator('input[type="text"]:visible');
      await expect(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
      await expect(allTextboxes.nth(1)).toBeVisible({ timeout: 5000 });
      await allTextboxes.nth(0).fill(names[i]);
      await allTextboxes.nth(1).fill(descs[i]);
      // Submit
      await page.getByRole('button', { name: new RegExp(itemGroupData.SubmitButton, 'i') }).click();
      // Handle duplicate pop-up
      let handledPopup = false;
      try {
        const errorPopup = page.locator(`div.modal-body:has-text("${itemGroupData.errorPopupText}")`);
        await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
        // Click OK button on popup by visible text
      const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
        if (await okBtn.isVisible()) {
          await okBtn.click();
          handledPopup = true;
          console.log(`❌ Item Group ${names[i]} already exists. Retrying after refresh.`);
          await page.reload();
          // Re-navigate to Item Group page after reload
          await page.getByRole('link', { name: /master/i }).click();
          await page.waitForTimeout(500);
          await page.getByRole('link', { name: /Item Group/i }).click();
          await page.waitForURL(/itemgroup/i);
          await expect(page).toHaveURL(/itemgroup/i);
          attempts++;
          continue; // Retry after refresh
        }
        await page.waitForTimeout(1000);
      } catch {
        await page.waitForTimeout(1000);
      }
      // Optionally, verify the new record is present (if not duplicate)
      if (!handledPopup) {
        await page.waitForTimeout(1000);
        const newRow = page.locator('table tbody tr', { hasText: names[i] });
        await expect(newRow).toBeVisible({ timeout: 5000 });
        added = true; // Exit retry loop
        console.log(`✅ Item Group ${names[i]} added successfully.`);
      }
    }
  }

//   // 14. Click the "Submit" button
//   try {
//     await dialog.getByRole('button', { name: /Submit/i }).click();
//   } catch (e) {
//     // Debug output: list all visible dialogs and buttons
//     const dialogs = await page.locator('dialog').allTextContents();
//     const buttons = await dialog.getByRole('button').allTextContents();
//     console.log('Visible dialogs:', dialogs);
//     console.log('Buttons in dialog:', buttons);
//     throw e;
//   }

  // 15. (No SweetAlert2 success popup is shown, skip this step)

  // 16. Verify the new record is present and check No of Records count
  // Wait for table to reload

  // Optionally, check No of Records count after all insertions
  const countLabel = page.locator('label.form-label.text-primary.fw-bold.mx-2');
  const countText = await countLabel.textContent();
  expect(Number(countText)).toBeGreaterThan(0);

});

