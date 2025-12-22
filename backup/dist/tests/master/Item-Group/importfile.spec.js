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
(0, test_1.test)('import item group file and verify import', async ({ page }) => {
    const excelFile = path_1.default.resolve(__dirname, 'ItemGroupImport.xlsx');
    const excelData = (0, excelUtils_1.readExcel)(excelFile);
    if (!excelData || excelData.length === 0) {
        throw new Error('Excel data is empty or not parsed correctly.');
    }
    const headers = Object.keys(excelData[0]).map(h => h.trim());
    console.log('Excel column headers:', headers);
    const groupNameColumn = headers.find(h => h.toLowerCase().includes('item group')) || headers[0];
    const descColumn = headers.find(h => h.toLowerCase().includes('description')) || headers[1];
    const excelRows = excelData.map(row => ({
        groupName: row[groupNameColumn]?.toString().trim(),
        groupDesc: row[descColumn]?.toString().trim()
    })).filter(r => r.groupName);
    console.log('Excel rows:', excelRows);
    await page.goto(`${loginData_1.loginData.baseUrl}auth/login`);
    await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(`${loginData_1.loginData.baseUrl}master/itemGroup`);
    await (0, test_1.expect)(page).toHaveURL(`${loginData_1.loginData.baseUrl}master/itemGroup`);
    await page.getByRole('button', { name: /Import/i }).click();
    await page.setInputFiles('input[type="file"]', excelFile);
    await page.getByRole('button', { name: /Verify & Confirm/i }).click();
    let importSuccess = false;
    try {
        if (!importSuccess) {
            console.log("Import did not trigger popup, validating in DB instead");
        }
        await page.waitForSelector('text=imported successfully', { timeout: 15000 });
        const successMessage = page.getByText('imported successfully', { exact: false });
        await (0, test_1.expect)(successMessage).toBeVisible();
        importSuccess = true;
        await page.getByRole('button', { name: /OK/i }).click();
        await page.waitForTimeout(2000);
    }
    catch {
        let allExist = true;
        for (const { groupName } of excelRows) {
            const dbRows = await (0, db_1.queryDb)(`
      SELECT PartGrp, PartGrpDesc FROM Master_PartGroup WHERE PartGrp = '${groupName}'`);
            if (!dbRows || dbRows.length === 0) {
                allExist = false;
                break;
            }
        }
        if (allExist) {
            await page.evaluate(() => {
                alert("Import Failed\nAll records already exist in the database");
            });
            await page.waitForTimeout(2000);
            console.log('Records already exist in DB:', excelRows.map(r => r.groupName).join(', '));
            return;
        }
        else {
            throw new Error('Import failed for unknown reasons.');
        }
    }
    for (const { groupName, groupDesc } of excelRows) {
        const dbRows = await (0, db_1.queryDb)(`
      SELECT PartGrp, PartGrpDesc FROM Master_PartGroup WHERE PartGrp = '${groupName}'`);
        (0, test_1.expect)(dbRows.length).toBeGreaterThan(0);
        (0, test_1.expect)(dbRows[0].PartGrp).toBe(groupName);
        if (groupDesc) {
            (0, test_1.expect)(dbRows[0].PartGrpDesc?.trim()).toBe(groupDesc);
        }
        console.log(`Verified in DB: ${groupName} -> ${groupDesc}`);
    }
});
//# sourceMappingURL=importfile.spec.js.map