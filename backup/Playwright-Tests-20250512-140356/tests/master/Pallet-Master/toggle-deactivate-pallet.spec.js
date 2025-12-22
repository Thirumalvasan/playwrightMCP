"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const palletMasterData_1 = require("../../../testData/palletMasterData");
(0, test_1.test)('deactivate pallet record for sno 1 and verify update', async ({ page }) => {
    // 1) Navigate to login page
    await page.goto(palletMasterData_1.palletMasterData.baseUrl + 'auth/login');
    // 2) Enter the username
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData_1.loginData.username);
    // 3) Enter the password
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    // 4) Click the login button
    await page.getByRole('button', { name: /Log In/i }).click();
    // 5) Check the url
    await page.waitForURL(palletMasterData_1.palletMasterData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(palletMasterData_1.palletMasterData.baseUrl);
    // 6) Click the master menu dropdown and select pallet master
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500); // wait for menu to open
    await page.getByRole('link', { name: /Pallet Master/i }).click();
    // 7) Check the url for palletmaster list page
    await page.waitForURL(palletMasterData_1.palletMasterData.baseUrl + 'master/palletmaster');
    await (0, test_1.expect)(page).toHaveURL(palletMasterData_1.palletMasterData.baseUrl + 'master/palletmaster');
    // 8) Click the toggle icon for sno record 1 (first .code-switcher input)
    const firstToggle = page.locator('input.code-switcher').first();
    const wasChecked = await firstToggle.isChecked();
    await firstToggle.click();
    // 9) Check the confirmation pop-up appears
    const confirmPopup = page.locator('div.swal2-popup.swal2-modal.swal2-icon-warning');
    await (0, test_1.expect)(confirmPopup).toBeVisible({ timeout: 5000 });
    await (0, test_1.expect)(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to Deactivate it\?/i);
    // 10) Click the "Yes, Deactivate it!" button
    const yesBtn = confirmPopup.locator('button.swal2-confirm');
    await yesBtn.click();
    // 11) After, check the screen that the toggle action is updated
    await page.waitForTimeout(1000);
    const isChecked = await firstToggle.isChecked();
    (0, test_1.expect)(isChecked).not.toBe(wasChecked);
    // 12) Show the screen for 1 minute
    await page.waitForTimeout(1000);
    // Internal (test-only) confirmation pop-up simulation
    const internalConfirm = async () => {
        return true; // Change to false to simulate 'No'
    };
    if (await internalConfirm()) {
        // User chose Yes: reload the page and set the toggle to Active
        await page.reload();
        await page.waitForTimeout(1000);
        const toggleAfterReload = page.locator('input.code-switcher').first();
        const isNowChecked = await toggleAfterReload.isChecked();
        if (!isNowChecked) {
            await toggleAfterReload.click();
            await page.waitForTimeout(1000);
            const activatePopup = page.locator('div.swal2-popup.swal2-modal.swal2-icon-warning');
            await (0, test_1.expect)(activatePopup).toBeVisible({ timeout: 5000 });
            await (0, test_1.expect)(activatePopup.locator('button.swal2-confirm')).toHaveText(/Yes, Activate it!/i);
            await activatePopup.locator('button.swal2-confirm').click();
            await page.waitForTimeout(1000);
        }
        (0, test_1.expect)(await toggleAfterReload.isChecked()).toBe(true);
        await page.waitForTimeout(60000);
    }
    else {
        await page.waitForTimeout(60000);
    }
});
