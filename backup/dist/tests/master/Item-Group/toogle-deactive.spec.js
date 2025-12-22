"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const ItemGroupData_1 = require("../../../testData/ItemGroupData");
const db_1 = require("../../../Database/db");
async function gotoItemGroup(page) {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
}
async function toggleItemGroup(page, itemGroupName, action) {
    const row = page.locator('table tbody tr', { hasText: itemGroupName });
    await (0, test_1.expect)(row).toBeVisible({ timeout: 5000 });
    const toggle = row.locator('input.code-switcher');
    const wasChecked = await toggle.isChecked();
    if ((action === 'deactivate' && wasChecked) || (action === 'activate' && !wasChecked)) {
        await toggle.click();
        const confirmPopup = page.locator('div.swal2-popup.swal2-modal.swal2-icon-warning');
        await (0, test_1.expect)(confirmPopup).toBeVisible({ timeout: 5000 });
        if (action === 'deactivate') {
            await (0, test_1.expect)(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to Deactivate it\?/i);
        }
        else {
            await (0, test_1.expect)(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to Activate it\?/i);
        }
        const yesBtn = confirmPopup.locator('button.swal2-confirm');
        await yesBtn.click();
        await page.waitForTimeout(1000);
    }
    const dbResult = await (0, db_1.queryDb)(`SELECT IsDelete FROM Master_PartGroup WHERE PartGrp = '${itemGroupName}'`);
    (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
    if (action === 'deactivate') {
        (0, test_1.expect)(dbResult[0].IsDelete).toBe(true);
    }
    else {
        (0, test_1.expect)(dbResult[0].IsDelete).toBe(false);
    }
    const isChecked = await toggle.isChecked();
    if (action === 'deactivate') {
        (0, test_1.expect)(isChecked).toBe(false);
    }
    else {
        (0, test_1.expect)(isChecked).toBe(true);
    }
}
(0, test_1.test)('deactivate item group by name and verify DB', async ({ page }) => {
    const itemGroupName = ItemGroupData_1.itemGroupData.deactiveitem;
    await gotoItemGroup(page);
    await toggleItemGroup(page, itemGroupName, 'deactivate');
    await page.waitForTimeout(2000);
});
(0, test_1.test)('activate item group by name and verify DB', async ({ page }) => {
    const itemGroupName = ItemGroupData_1.itemGroupData.activeitem;
    await gotoItemGroup(page);
    await toggleItemGroup(page, itemGroupName, 'activate');
    await page.waitForTimeout(2000);
});
//# sourceMappingURL=toogle-deactive.spec.js.map