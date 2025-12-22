"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const ItemGroupData_1 = require("../../../testData/ItemGroupData");
const db_1 = require("../../../Database/db");
async function gotoItemGroup(page) {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(/itemgroup/i);
    await (0, test_1.expect)(page).toHaveURL(/itemgroup/i);
}
async function getItemGroupCountFromDb() {
    const result = await (0, db_1.queryDb)('SELECT COUNT(*) AS count FROM Master_PartGroup WITH(NOLOCK) WHERE IsDelete = 0');
    return result[0].count;
}
async function additemgroup(page, itemgroupname, itemgroupdesc) {
    await page.getByRole('button', { name: new RegExp(ItemGroupData_1.itemGroupData.addButton, 'i') }).click();
    await page.waitForURL(/itemgroup/i);
    await (0, test_1.expect)(page).toHaveURL(/itemgroup/i);
    const dialog = page.getByRole('dialog');
    await (0, test_1.expect)(dialog).toBeVisible();
    const allTextboxes = page.locator('input[type="text"]:visible');
    await (0, test_1.expect)(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
    await (0, test_1.expect)(allTextboxes.nth(1)).toBeVisible({ timeout: 5000 });
    await allTextboxes.nth(0).fill(itemgroupname);
    await allTextboxes.nth(1).fill(itemgroupdesc);
    await page.getByRole('button', { name: new RegExp(ItemGroupData_1.itemGroupData.SubmitButton, 'i') }).click();
    let handledPopup = false;
    try {
        const errorPopup = page.locator(`div.modal-body:has-text("${ItemGroupData_1.itemGroupData.errorPopupText}")`);
        await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
        const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
        if (await okBtn.isVisible()) {
            await okBtn.click();
            handledPopup = true;
            console.log(`Item Group ${itemgroupname} already exists.`);
            await page.reload();
            return;
        }
    }
    catch {
    }
    if (!handledPopup) {
        await page.waitForTimeout(2000);
        console.log(` Item Group ${itemgroupname} added successfully.`);
    }
    const dbResult = await (0, db_1.queryDb)(`SELECT PartGrp, PartGrpDesc FROM Master_PartGroup WHERE PartGrp = '${itemgroupname}'`);
    (0, test_1.expect)(dbResult.length).toBeGreaterThan(0);
    (0, test_1.expect)(dbResult[0].PartGrp).toBe(itemgroupname);
    (0, test_1.expect)(dbResult[0].PartGrpDesc).toBe(itemgroupdesc);
    console.log(`Item Group ${itemgroupname} verified in DB.`);
}
(0, test_1.test)('Add multiple Item Groups and verify record count', async ({ page }) => {
    await gotoItemGroup(page);
    for (let i = 1; i <= ItemGroupData_1.itemGroupData.itemgroupcount; i++) {
        await additemgroup(page, `${ItemGroupData_1.itemGroupData.itemGroupdesc}${i}`, `${ItemGroupData_1.itemGroupData.itemGroupdesc}${i}`);
    }
    const dbCount = await getItemGroupCountFromDb();
    const uiCountText = await page.locator('div.record-count').innerText();
    const uiCountMatch = uiCountText.match(/Total Records:\s*(\d+)/i);
    let uiCount = 0;
    if (uiCountMatch) {
        uiCount = parseInt(uiCountMatch[1], 10);
    }
    (0, test_1.expect)(uiCount).toBe(dbCount);
    console.log(`UI count (${uiCount}) matches DB count (${dbCount}).`);
});
//# sourceMappingURL=add-item-group.spec.js.map