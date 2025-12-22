"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const palletMasterData_1 = require("../../../testData/palletMasterData");
(0, test_1.test)('pallet master export PDF, Excel, CSV', async ({ page }) => {
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
    const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
    async function downloadFile(buttonText, fileExtension) {
        await exportBtn.click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('a.dropdown-item', { hasText: buttonText }).click(),
        ]);
        const filePath = `./Downloads/PalletMaster_${Date.now()}.${fileExtension}`;
        await download.saveAs(filePath);
        console.log(`${buttonText} downloaded at:`, filePath);
    }
    await downloadFile('EXCEL', 'xlsx');
    await downloadFile('CSV', 'csv');
    await downloadFile('PDF', 'pdf');
    await page.waitForTimeout(2000);
});
//# sourceMappingURL=export-pallet.spec.js.map