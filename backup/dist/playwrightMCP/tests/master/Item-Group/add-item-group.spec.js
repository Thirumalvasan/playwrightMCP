"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../../testData/loginData");
const ItemGroupData_1 = require("../../../../testData/ItemGroupData");
(0, test_1.test)('Add multiple Item Groups and verify record count', async ({ page }) => {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(/itemgroup/i);
    await (0, test_1.expect)(page).toHaveURL(/itemgroup/i);
    const names = ItemGroupData_1.itemGroupData.itemgroupname;
    const descs = ItemGroupData_1.itemGroupData.itemGroupdesc;
    for (let i = 0; i < ItemGroupData_1.itemGroupData.itemgroupcount; i++) {
        let added = false;
        let attempts = 0;
        while (!added && attempts < 1) {
            await page.getByRole('button', { name: new RegExp(ItemGroupData_1.itemGroupData.addButton, 'i') }).click();
            await page.waitForURL(/itemgroup/i);
            await (0, test_1.expect)(page).toHaveURL(/itemgroup/i);
            const dialog = page.getByRole('dialog');
            await (0, test_1.expect)(dialog).toBeVisible();
            const allTextboxes = page.locator('input[type="text"]:visible');
            await (0, test_1.expect)(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
            await (0, test_1.expect)(allTextboxes.nth(1)).toBeVisible({ timeout: 5000 });
            await allTextboxes.nth(0).fill(names[i]);
            await allTextboxes.nth(1).fill(descs[i]);
            await page.getByRole('button', { name: new RegExp(ItemGroupData_1.itemGroupData.SubmitButton, 'i') }).click();
            let handledPopup = false;
            try {
                const errorPopup = page.locator(`div.modal-body:has-text("${ItemGroupData_1.itemGroupData.errorPopupText}")`);
                await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
                const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
                if (await okBtn.isVisible()) {
                    await okBtn.click();
                    handledPopup = true;
                    console.log(`❌ Item Group ${names[i]} already exists. Retrying after refresh.`);
                    await page.reload();
                    await page.getByRole('link', { name: /master/i }).click();
                    await page.waitForTimeout(500);
                    await page.getByRole('link', { name: /Item Group/i }).click();
                    await page.waitForURL(/itemgroup/i);
                    await (0, test_1.expect)(page).toHaveURL(/itemgroup/i);
                    attempts++;
                    continue;
                }
                await page.waitForTimeout(1000);
            }
            catch {
                await page.waitForTimeout(1000);
            }
            if (!handledPopup) {
                await page.waitForTimeout(1000);
                const newRow = page.locator('table tbody tr', { hasText: names[i] });
                await (0, test_1.expect)(newRow).toBeVisible({ timeout: 5000 });
                added = true;
                console.log(`✅ Item Group ${names[i]} added successfully.`);
            }
        }
    }
    const countLabel = page.locator('label.form-label.text-primary.fw-bold.mx-2');
    const countText = await countLabel.textContent();
    (0, test_1.expect)(Number(countText)).toBeGreaterThan(0);
});
//# sourceMappingURL=add-item-group.spec.js.map