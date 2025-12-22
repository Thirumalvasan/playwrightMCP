"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const UomMasterUtils_1 = require("../../../utils/UomMasterUtils");
const Uom_MasterData_1 = require("../../../testData/Uom-MasterData");
(0, test_1.test)('UOM Sorting and Filtering', async ({ page }) => {
    await login(page);
    await gotoUomMaster(page);
    const uomUtils = new UomMasterUtils_1.UomMasterUtils(page);
    await uomUtils.toggleUomSortingASC();
    await uomUtils.toggleUomSortingDESC();
    await uomUtils.toggleTimestampSortingASC();
    await uomUtils.toggleTimestampSortingDESC();
    await testFilterFunctionality(page, uomUtils);
});
async function testFilterFunctionality(page, uomUtils) {
    const filterValue = Uom_MasterData_1.UomMasterData.FilterUomName[0];
    console.log(`Applying filter for UOM: "${filterValue}"`);
    const initialRows = await page.locator('table tbody tr').count();
    console.log(`Initial row count: ${initialRows}`);
    await uomUtils.filterByUomName(filterValue);
    await waitForFilterToApply(page);
    await debugTableContents(page);
    const firstRowValue = await page.locator('table tbody tr:first-child td:nth-child(1)').innerText();
    console.log(`Filtered first row: "${firstRowValue}"`);
    (0, test_1.expect)(firstRowValue).toContain(filterValue);
    const filteredRows = await page.locator('table tbody tr').count();
    console.log(`Filtered row count: ${filteredRows}`);
    (0, test_1.expect)(filteredRows).toBeGreaterThan(0);
    await clearFilter(page, uomUtils);
    await page.waitForTimeout(800);
    const finalRows = await page.locator('table tbody tr').count();
    console.log(`Final row count after clearing filter: ${finalRows}`);
    (0, test_1.expect)(finalRows).toBe(initialRows);
}
async function waitForFilterToApply(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    try {
        await page.waitForSelector('table tbody tr', { timeout: 5000 });
    }
    catch {
        console.log('⚠ No table rows found after filter — possibly zero results');
    }
    await page.waitForFunction(() => {
        const rows = document.querySelectorAll('table tbody tr');
        if (rows.length === 0)
            return true;
        const first = document.querySelector('table tbody tr:first-child td:nth-child(1)');
        return first && first.textContent?.trim().length > 0;
    }, { timeout: 8000 });
}
async function debugTableContents(page) {
    console.log('===== TABLE DEBUG START =====');
    const rows = await page.locator('table tbody tr').count();
    console.log(`Row count: ${rows}`);
    if (rows > 0) {
        const firstRow = await page.locator('table tbody tr:first-child td').allInnerTexts();
        console.log('First row data:', firstRow);
        const allFirstCol = await page.locator('table tbody tr td:nth-child(1)').allInnerTexts();
        console.log('All UOM column values:', allFirstCol);
    }
    else {
        console.log('⚠ Table has no rows.');
    }
    console.log('===== TABLE DEBUG END =====');
}
async function clearFilter(page, uomUtils) {
    console.log('Clearing filter...');
    try {
        if (uomUtils.clearFilter) {
            await uomUtils.clearFilter();
        }
        else {
            await page.getByPlaceholder('Search...').fill('');
            await page.getByPlaceholder('Search...').press('Enter');
        }
    }
    catch {
        console.log('Fallback: page reload to clear filter');
        await page.reload();
        await page.waitForSelector('table tbody tr');
    }
}
async function login(page) {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
}
async function gotoUomMaster(page) {
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('link', { name: /UOM Master/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/uom');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/uom');
}
//# sourceMappingURL=sort-filter.spec.js.map