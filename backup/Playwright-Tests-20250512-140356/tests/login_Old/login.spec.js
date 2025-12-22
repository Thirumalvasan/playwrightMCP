"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)('add itemmaster after login', async ({ page }) => {
    // Generate a unique item code for this test run
    const uniqueItemCode = `ragice${Date.now()}`;
    // Step 1: Navigate to login page
    await page.goto('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login');
    // Step 2: Enter username
    await page.getByRole('textbox', { name: 'Enter Username' }).fill('admin');
    // Step 3: Enter password
    await page.getByRole('textbox', { name: 'Enter Password' }).fill('Sft@Cal');
    // Step 4: Click login button
    await page.getByRole('button', { name: /Log In/i }).click();
    // Step 5: Check for successful navigation
    await (0, test_1.expect)(page).toHaveURL('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/');
    // Step 6: Click the master menu dropdown and select itemmaster
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500); // wait for menu to open
    await page.getByRole('link', { name: /Item Master/i }).click();
    // Step 7: Click the add button
    await page.getByRole('button', { name: /add/i }).click();
    // Step 8: Enter the itemcode: unique value
    // Use a robust locator for ItemCode textbox in dialog
    await page.locator('text=ItemCode').locator('..').locator('input').fill(uniqueItemCode);
    //  await page.getByLabel('ItemCode').fill('tyagice001');
    // Step 9: Enter the itemname: iceragi
    await page.locator('text=ItemName').locator('..').locator('input').fill('iceragi');
    // Step 10: Select the itemgroup: test
    await page.locator('text=Item Group').locator('..').locator('select').selectOption({ label: 'test' });
    // Step 11: Enter the palletqty: 10
    await page.locator('text=Pallet Qty').locator('..').locator('input[type="number"]').fill('10');
    // Step 11.1: Enter the shelf life: 365
    await page.locator('text=Shelf Life').locator('..').locator('input[type="number"], input').fill('365');
    // Step 12: Select the UOM: Box using robust locator
    await page.locator('text=UOM').locator('..').locator('select').selectOption({ label: 'Box' });
    // Step 13: Click the Submit button using visible text
    await page.locator('button:has-text("Submit")').click();
    // Step 15: Validate the item in the table grid with pagination
    // Wait for the table/grid to update
    await page.waitForTimeout(2000); // Adjust as needed for your app
    // Find the itemcode in the table
    let found = false;
    while (!found) {
        const row = page.getByRole('row', { name: new RegExp(uniqueItemCode, 'i') });
        if (await row.count() > 0) {
            await (0, test_1.expect)(row).toContainText(uniqueItemCode);
            await (0, test_1.expect)(row).toContainText('iceragi');
            await (0, test_1.expect)(row).toContainText('test');
            await (0, test_1.expect)(row).toContainText('10');
            await (0, test_1.expect)(row).toContainText('365');
            await (0, test_1.expect)(row).toContainText('Box');
            found = true;
            console.log(`✅ Item ${uniqueItemCode} found in table`);
            break;
        }
        // If not found, try to click "Next" page
        const nextButton = page.getByRole('button', { name: /Next/i });
        if (await nextButton.isDisabled()) {
            throw new Error(`❌ Item ${uniqueItemCode} not found in table after scanning all pages`);
        }
        await nextButton.click();
        await page.waitForTimeout(1000); // wait for table refresh
    }
});
