"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const palletMasterData_1 = require("../../../testData/palletMasterData");
(0, test_1.test)('import pallet file and verify import', async ({ page }) => {
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
    await page.getByRole('button', { name: /Import/i }).click();
    const filePath = palletMasterData_1.palletMasterData.sampleFile;
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    const verifyBtn = page.getByRole('button', { name: /Verify & Confirm/i });
    await verifyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await verifyBtn.click();
    const successMsg = page.locator('.swal2-popup .swal2-title');
    await (0, test_1.expect)(successMsg).toHaveText(/Success/i, { timeout: 10000 });
    await page.getByRole('button', { name: /OK/i }).click();
});
//# sourceMappingURL=import-pallet-file.spec.js.map