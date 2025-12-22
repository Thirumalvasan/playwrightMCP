"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const Uom_MasterData_1 = require("../../../testData/Uom-MasterData");
const db_1 = require("../../../Database/db");
async function gotoUomMaster(page) {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /UOM Master/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/uom');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/uom');
}
async function addUom(page, uomName) {
    await page.getByRole('button', { name: new RegExp(Uom_MasterData_1.UomMasterData.addButton, 'i') }).click();
    await page.waitForURL(/uom/i);
    await (0, test_1.expect)(page).toHaveURL(/uom/i);
    const dialog = page.getByRole('dialog');
    await (0, test_1.expect)(dialog).toBeVisible();
    const allTextboxes = page.locator('input[type="text"]:visible');
    await (0, test_1.expect)(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
    await allTextboxes.nth(0).fill(uomName);
    await page.getByRole('button', { name: new RegExp(Uom_MasterData_1.UomMasterData.SubmitButton, 'i') }).click();
    let handledPopup = false;
    try {
        const errorPopup = page.locator(`div.modal-body:has-text("UOM already exists")`);
        await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
        const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
        if (await okBtn.isVisible()) {
            await okBtn.click();
            const dbResult = await (0, db_1.queryDb)(`SELECT UOM FROM UOM_Master WHERE UOM = '${uomName}'`);
            (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
            (0, test_1.expect)(dbResult[0].UOM).toBe(uomName);
            console.log(`UOM ${uomName} already exists. Verified in DB.`);
            handledPopup = true;
            await page.reload();
            return;
        }
    }
    catch {
    }
    if (!handledPopup) {
        await page.waitForTimeout(2000);
        console.log(` UOM ${uomName} added successfully.`);
    }
    const dbResult = await (0, db_1.queryDb)(`SELECT UOM FROM UOM_Master WHERE UOM = '${uomName}'`);
    (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
    (0, test_1.expect)(dbResult[0].UOM).toBe(uomName);
    console.log(`UOM ${uomName} verified in DB.`);
}
async function editUom(page, oldUomName, newUomName) {
    const row = page.locator('table tbody tr', { hasText: oldUomName });
    await (0, test_1.expect)(row).toBeVisible({ timeout: 10000 });
    const editBtn = row.locator('li.edit button.edit-item-btn');
    await (0, test_1.expect)(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();
    const dialog = page.getByRole('dialog');
    await (0, test_1.expect)(dialog).toBeVisible();
    const textbox = dialog.locator('input[type="text"]:visible').first();
    await textbox.fill(newUomName);
    const updateBtn = dialog.locator('button.btn.btn-primary.btn-load');
    await (0, test_1.expect)(updateBtn).toBeVisible({ timeout: 5000 });
    await updateBtn.click();
    await page.waitForTimeout(2000);
    console.log(`UOM ${oldUomName} → ${newUomName} edited successfully.`);
    const dbResult = await (0, db_1.queryDb)(`SELECT UOM FROM UOM_Master WHERE UOM = '${newUomName}'`);
    (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
    (0, test_1.expect)(dbResult[0].UOM).toBe(newUomName);
    console.log(`UOM ${newUomName} verified in DB.`);
}
(0, test_1.test)('Add multiple UOM and verify in DB', async ({ page }) => {
    await gotoUomMaster(page);
    for (let i = 0; i < Uom_MasterData_1.UomMasterData.uomcount; i++) {
        await addUom(page, Uom_MasterData_1.UomMasterData.uomname[i]);
    }
});
(0, test_1.test)('Edit UOM and verify in DB', async ({ page }) => {
    await gotoUomMaster(page);
    await editUom(page, Uom_MasterData_1.UomMasterData.oldUomName, Uom_MasterData_1.UomMasterData.newUomName);
    await page.waitForTimeout(2000);
});
