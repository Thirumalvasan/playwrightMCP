"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const palletMasterData_1 = require("../../../testData/palletMasterData");
function getTimeString(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
(0, test_1.test)('pallet master pagination and refresh tests', async ({ page }) => {
    test_1.test.setTimeout(70000);
    await page.goto(palletMasterData_1.palletMasterData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(palletMasterData_1.palletMasterData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(palletMasterData_1.palletMasterData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Pallet Master/i }).click();
    await page.waitForURL(palletMasterData_1.palletMasterData.baseUrl + 'master/palletmaster');
    await (0, test_1.expect)(page).toHaveURL(palletMasterData_1.palletMasterData.baseUrl + 'master/palletmaster');
    const lastPageBtn = page.getByRole('link', { name: /\d+/, exact: false }).last();
    await lastPageBtn.click();
    await page.waitForTimeout(1500);
    const lastPageRow = page.locator('table tbody tr');
    await (0, test_1.expect)(lastPageRow.first()).toBeVisible({ timeout: 5000 });
    const firstPageBtn = page.getByRole('link', { name: '1', exact: true }).first();
    await firstPageBtn.click();
    await page.waitForTimeout(1500);
    const firstPageRow = page.locator('table tbody tr');
    await (0, test_1.expect)(firstPageRow.first()).toBeVisible({ timeout: 5000 });
    const nextBtn = page.locator('a.page-link[aria-label="Next"]');
    await nextBtn.click();
    await page.waitForTimeout(1500);
    const nextPageRow = page.locator('table tbody tr');
    await (0, test_1.expect)(nextPageRow.first()).toBeVisible({ timeout: 5000 });
    const prevBtn = page.locator('a.page-link[aria-label="Previous"]');
    await prevBtn.click();
    await page.waitForTimeout(1500);
    const prevPageRow = page.locator('table tbody tr');
    await (0, test_1.expect)(prevPageRow.first()).toBeVisible({ timeout: 5000 });
    const refreshBtn = page.locator('span#basic-addon1.input-group-text.refresh');
    await refreshBtn.click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(30000);
});
//# sourceMappingURL=pagination-refresh-pallet.spec.js.map