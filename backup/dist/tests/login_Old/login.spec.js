"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)('add itemmaster after login', async ({ page }) => {
    const uniqueItemCode = `ragice${Date.now()}`;
    await page.goto('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Enter Password' }).fill('Sft@Cal');
    await page.getByRole('button', { name: /Log In/i }).click();
    await (0, test_1.expect)(page).toHaveURL('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/');
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Master/i }).click();
    await page.getByRole('button', { name: /add/i }).click();
    await page.locator('text=ItemCode').locator('..').locator('input').fill(uniqueItemCode);
    await page.locator('text=ItemName').locator('..').locator('input').fill('iceragi');
    await page.locator('text=Item Group').locator('..').locator('select').selectOption({ label: 'test' });
    await page.locator('text=Pallet Qty').locator('..').locator('input[type="number"]').fill('10');
    await page.locator('text=Shelf Life').locator('..').locator('input[type="number"], input').fill('365');
    await page.locator('text=UOM').locator('..').locator('select').selectOption({ label: 'Box' });
    await page.locator('button:has-text("Submit")').click();
    await page.waitForTimeout(2000);
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
        const nextButton = page.getByRole('button', { name: /Next/i });
        if (await nextButton.isDisabled()) {
            throw new Error(`❌ Item ${uniqueItemCode} not found in table after scanning all pages`);
        }
        await nextButton.click();
        await page.waitForTimeout(1000);
    }
});
//# sourceMappingURL=login.spec.js.map