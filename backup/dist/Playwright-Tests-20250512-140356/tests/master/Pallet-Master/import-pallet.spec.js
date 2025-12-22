"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const db_1 = require("../../../Database/db");
const excelUtils_1 = require("../../../utils/excelUtils");
const path_1 = __importDefault(require("path"));
(0, test_1.test)('import pallet and verify', async ({ page }) => {
    const excelFile = path_1.default.resolve(__dirname, 'PalletImport.xlsx');
    const excelData = (0, excelUtils_1.readExcel)(excelFile);
    if (!excelData || excelData.length === 0) {
        throw new Error('Excel data is empty or not parsed correctly.');
    }
    const headers = Object.keys(excelData[0]).map(h => h.trim());
    console.log('Excel column headers:', headers);
    const palletNameColumn = headers.find(h => h.toLowerCase().includes('pallet id')) || headers[0];
    const descColumn = headers.find(h => h.toLowerCase().includes('description')) || headers[1];
    const excelRows = excelData.map(row => ({
        palletName: row[palletNameColumn]?.toString().trim(),
        palletDesc: row[descColumn]?.toString().trim()
    })).filter(r => r.palletName);
    console.log('Excel rows:', excelRows);
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.getByRole('link', { name: /Pallet Master/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/palletmaster');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/palletmaster');
    await page.getByRole('button', { name: /Import/i }).click();
    await page.setInputFiles('input[type="file"]', excelFile);
    await page.getByRole('button', { name: /Verify & Confirm/i }).click();
    try {
        await page.waitForSelector('text=imported successfully', { timeout: 15000 });
        const successMessage = page.getByText('imported successfully', { exact: false });
        await (0, test_1.expect)(successMessage).toBeVisible();
        await page.getByRole('button', { name: /OK/i }).click();
        await page.waitForTimeout(2000);
    }
    catch {
        let allExist = true;
        for (const { palletName } of excelRows) {
            const dbResult = await (0, db_1.queryDb)(`
        SELECT PalletId FROM Master_Pallet WHERE PalletId = '${palletName}'`);
            if (!dbResult || dbResult.length === 0) {
                allExist = false;
                break;
            }
        }
        if (allExist) {
            await page.evaluate(() => {
                alert("Import Failed\nAll records already exist in the database");
            });
            await page.waitForTimeout(1000);
            console.log("Records already exist in DB:", excelRows.map(r => r.palletName).join(", "));
            return;
        }
        throw new Error("Import failed for unknown reasons.");
    }
    for (const { palletName, palletDesc } of excelRows) {
        const dbResult = await (0, db_1.queryDb)(`
      SELECT PalletId, Description 
      FROM Master_Pallet 
      WHERE PalletId = '${palletName}'`);
        (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
        const dbPallet = dbResult[0];
        (0, test_1.expect)(dbPallet.PalletId).toBe(palletName);
        (0, test_1.expect)(dbPallet.Description).toBe(palletDesc || null);
        console.log(`Pallet Import Verified in DB: ${palletName} -> ${palletDesc}`);
    }
});
//# sourceMappingURL=import-pallet.spec.js.map