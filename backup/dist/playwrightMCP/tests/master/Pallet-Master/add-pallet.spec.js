"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const palletMasterData_1 = require("../../../testData/palletMasterData");
const db_1 = require("../../../Database/db");
function randomDescription() {
    const words = [
        'auto', 'test', 'pallet', 'entry', 'desc', 'random',
        'playwright', 'mcp', 'data', 'insert'
    ];
    return Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}
(0, test_1.test)('add multiple pallets in Pallet Master and validate DB insert', async ({ page }) => {
    test_1.test.setTimeout(60000);
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Pallet Master/i }).click();
    for (let i = 0; i < palletMasterData_1.palletMasterData.palletIdCount; i++) {
        await page.getByRole('button', { name: new RegExp(palletMasterData_1.palletMasterData.addButton, 'i') }).click();
        await page.waitForURL(loginData_1.loginData.baseUrl + 'master/palletmaster');
        await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/palletmaster');
        const palletId = `${palletMasterData_1.palletMasterData.palletIdPrefix}${palletMasterData_1.palletMasterData.palletIdStart + i}`;
        const palletIdInput = page.locator('label.form-label', { hasText: palletMasterData_1.palletMasterData.palletIdLabel }).locator('xpath=following-sibling::input');
        await palletIdInput.first().waitFor({ state: 'visible', timeout: 10000 });
        await palletIdInput.first().fill(palletId);
        const descInput = page.locator('label.form-label', { hasText: palletMasterData_1.palletMasterData.descriptionLabel }).locator('xpath=following-sibling::textarea');
        await descInput.first().waitFor({ state: 'visible', timeout: 10000 });
        const description = randomDescription();
        await descInput.first().fill(description);
        await page.getByRole('button', { name: new RegExp(palletMasterData_1.palletMasterData.submitButton, 'i') }).click();
        let handledPopup = false;
        try {
            const errorPopup = page.locator(`div.modal-body:has-text("${palletMasterData_1.palletMasterData.errorPopupText}")`);
            await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
            const okBtn = errorPopup.getByRole('button', { name: /^ok$/i });
            if (await okBtn.isVisible()) {
                await okBtn.click();
                handledPopup = true;
                await (0, test_1.expect)(errorPopup).toBeHidden({ timeout: 3000 });
                console.log(`❌ Pallet ID ${palletId} already exists. Skipping DB check.`);
            }
            else {
                console.log('⚠️ Duplicate popup OK button not found. Will attempt DB check.');
            }
            await page.waitForTimeout(1000);
        }
        catch {
            console.log(`✔️ Duplicate popup not found for Pallet ID ${palletId}. Will check DB.`);
        }
        if (!handledPopup) {
            let foundInDb = false;
            let attempts = 0;
            let rows;
            while (!foundInDb && attempts < 4) {
                rows = await (0, db_1.queryDb)(`SELECT TOP 1 PalletId, Description 
           FROM Master_Pallet 
           WHERE PalletId = '${palletId}' 
           ORDER BY UpdateDateTime DESC`);
                foundInDb = rows.length > 0;
                console.log(`[DEBUG] DB check attempt ${attempts + 1} - found rows: ${rows.length}`);
                if (!foundInDb) {
                    await new Promise(r => setTimeout(r, 2000));
                }
                attempts++;
            }
            (0, test_1.expect)(foundInDb).toBe(true);
            if (foundInDb) {
                (0, test_1.expect)(rows[0].PalletId).toBe(palletId);
                console.log(`✅ Pallet ID ${palletId} inserted successfully into DB.`);
            }
            else {
                console.error(`❌ Pallet ID ${palletId} NOT found in DB after submit.`);
            }
        }
        await page.goto(loginData_1.loginData.baseUrl + 'master/palletmaster');
        await page.waitForTimeout(500);
    }
}, 120000);
//# sourceMappingURL=add-pallet.spec.js.map