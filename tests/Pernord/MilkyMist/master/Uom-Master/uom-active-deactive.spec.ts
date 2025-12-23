import {test, expect, Page} from '@playwright/test';
import { loginData } from '@testData/loginData';
import { UomMasterData } from '@testData/Uom-MasterData';
import { queryDb } from '@database/db';

async function gotoUomMaster(page: Page) {
    await page.goto(loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /UOM Master/i }).click();
    await page.waitForURL(loginData.baseUrl + 'master/uom');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/uom');
}

async function toggleUomStatus(page: Page, UOMName: string, action: 'deactivate' | 'activate') {
    const allUoms = await queryDb('SELECT UOM FROM UOM_Master');
    console.log('All UOMs in DB:', allUoms.map(u => u.UOM));

    const row = page.locator('table tbody tr').filter({ hasText: UOMName }).first();
    await expect(row).toBeVisible({ timeout: 5000 });
    const toggle = row.locator(':scope input.code-switcher');
    await expect(toggle).toBeVisible({ timeout: 3000 });
    const wasChecked = await toggle.isChecked();

    if ((action === 'deactivate' && wasChecked) || (action === 'activate' && !wasChecked)) {
        await toggle.click();
        const confirmPopup = page.locator('div.swal2-popup.swal2-modal.swal2-icon-warning');
        await expect(confirmPopup).toBeVisible({timeout:5000});
        if (action === 'deactivate') {
            await expect(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to Deactivate it\?/i);
        } else { 
            await expect(confirmPopup.locator('#swal2-html-container')).toHaveText(/Are you sure want to Activate it\?/i);
        }
        const yesBtn = confirmPopup.locator('button.swal2-confirm');
        await yesBtn.click();
        await page.waitForTimeout(1000);
    }   

    const dbResult = await queryDb(`SELECT IsDelete FROM UOM_Master WHERE LOWER(LTRIM(RTRIM(UOM))) = LOWER(LTRIM(RTRIM('${UOMName}')))`);
    expect(dbResult.length).toBeGreaterThan(0);
    if (action === 'deactivate') {
        expect(dbResult[0].IsDelete).toBe(true);
    } else {
        expect(dbResult[0].IsDelete).toBe(false);
    }

    const isChecked = await toggle.isChecked();
    if (action === 'deactivate') {
        expect(isChecked).toBe(false);
    } else {
        expect(isChecked).toBe(true);
    }
}

test('deactivate UOM by name and verify DB', async({page}) => {
    const DeactivateUOM = UomMasterData.DeactivateUOM; 
    await gotoUomMaster(page);
    await toggleUomStatus(page, DeactivateUOM, 'deactivate');

    const ActivateUOM = UomMasterData.ActivateUOM; 
    await toggleUomStatus(page, ActivateUOM, 'activate');
});

