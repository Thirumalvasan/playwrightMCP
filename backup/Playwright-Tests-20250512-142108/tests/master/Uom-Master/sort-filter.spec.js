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
    console.log(`Applying filter for UOM name: "${filterValue}"`);
    const initialRowCount = await page.locator('table tbody tr').count();
    console.log(`Initial row count: ${initialRowCount}`);
    await uomUtils.filterByUomName(filterValue);
    await waitForFilterToApply(page, filterValue);
    await debugTableContents(page);
    const firstRowText = await page.locator('table tbody tr:first-child td:nth-child(1)').innerText();
    console.log(`First row text after filter: "${firstRowText}"`);
    console.log(`Expected to contain: "${filterValue}"`);
    (0, test_1.expect)(firstRowText).toContain(filterValue);
    const filteredRowCount = await page.locator('table tbody tr').count();
    console.log(`Filtered row count: ${filteredRowCount}`);
    await (0, test_1.expect)(page.locator('table tbody tr')).toHaveCount(1);
    await clearFilter(page, uomUtils);
    await page.waitForTimeout(1000);
    const finalRowCount = await page.locator('table tbody tr').count();
    console.log(`Final row count after clearing filter: ${finalRowCount}`);
    (0, test_1.expect)(finalRowCount).toBe(initialRowCount);
}
async function waitForFilterToApply(page, filterValue) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    try {
        await page.waitForSelector('table tbody tr', { timeout: 5000 });
    }
    catch (error) {
        console.log('No rows found in table after filter - might be expected if no matches');
    }
    await page.waitForFunction((expectedText) => {
        const rows = document.querySelectorAll('table tbody tr');
        if (rows.length === 0)
            return true;
        const firstRow = document.querySelector('table tbody tr:first-child td:nth-child(1)');
        return firstRow && firstRow.textContent;
    }, filterValue, { timeout: 10000 });
}
async function debugTableContents(page) {
    console.log('=== DEBUG TABLE CONTENTS ===');
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`Total rows: ${rowCount}`);
    if (rowCount > 0) {
        const firstRowColumns = await page.locator('table tbody tr:first-child td').allInnerTexts();
        console.log('First row columns:', firstRowColumns);
        const allFirstColumns = await page.locator('table tbody tr td:nth-child(1)').allInnerTexts();
        console.log('All first column values:', allFirstColumns);
    }
    else {
        console.log('No rows found in table');
    }
    console.log('=== END DEBUG ===');
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
    catch (error) {
        console.log('Using alternative clear method');
        await page.reload();
        await page.waitForSelector('table tbody tr');
    }
}
async function login(page) {
    await page.goto(`${loginData_1.loginData.baseUrl}auth/login`);
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
}
async function gotoUomMaster(page) {
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /UOM Master/i }).click();
    await page.waitForURL(`${loginData_1.loginData.baseUrl}master/uom`);
    await (0, test_1.expect)(page).toHaveURL(`${loginData_1.loginData.baseUrl}master/uom`);
    await page.locator('body').click({ position: { x: 10, y: 10 } });
}
