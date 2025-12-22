"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
(0, test_1.test)('item group export Excel, CSV, PDF', async ({ page }) => {
    test_1.test.setTimeout(90000);
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
    const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
    async function downloadFile(buttonText, fileExtension) {
        await exportBtn.click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('a.dropdown-item', { hasText: buttonText }).click(),
        ]);
        const filePath = `./Downloads/ItemGroup_${Date.now()}.${fileExtension}`;
        await download.saveAs(filePath);
        console.log(`${buttonText} downloaded at:`, filePath);
    }
    await downloadFile('EXCEL', 'xlsx');
    await downloadFile('CSV', 'csv');
    await page.waitForTimeout(2000);
});
