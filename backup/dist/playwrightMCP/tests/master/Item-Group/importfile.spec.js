"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
(0, test_1.test)('import itemgroup file and verify import', async ({ page }) => {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(/itemGroup/i);
    await (0, test_1.expect)(page).toHaveURL(/itemGroup/i);
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
    await page.getByRole('button', { name: /Import/i }).click();
    await page.setInputFiles('input[type="file"]', 'tests/master/Item-Group/ItemGroupImport.xlsx');
    await page.getByRole('button', { name: /Verify & Confirm/i }).click();
    const successMessage = page.locator('div.modal-body:has-text("Import Successful")');
    await (0, test_1.expect)(successMessage).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(2000);
});
//# sourceMappingURL=importfile.spec.js.map