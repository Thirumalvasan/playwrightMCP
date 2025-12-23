import {test, expect} from '@playwright/test';
import {loginData} from '@testData/loginData';
import {itemGroupData} from '@testData/ItemGroupData';
import { queryDb } from '@database/db';
import { Page } from '@playwright/test';

async function gotoItemGroup(page: Page) {
    await page.goto(loginData.baseUrl+'auth/login');
    await page.getByRole('textbox',{name:'Enter Username'}).fill(loginData.username);
    await page.getByRole('textbox',{name:'Enter Password'}).fill(loginData.password);
    await page.getByRole('button',{name:/Log In/i}).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.getByRole('link',{name:/master/i}).click();
    await page.waitForTimeout(500);
    await page.getByRole('link',{name:/Item Group/i}).click();
    await page.waitForURL(loginData.baseUrl+'master/itemGroup');
    await expect(page).toHaveURL(loginData.baseUrl+'master/itemGroup');
}
async function toggleItemGroup(page: Page, itemGroupName: string, action: 'deactivate' | 'activate') {

    const row = page.locator('table tbody tr', { hasText: itemGroupName });
    await expect(row).toBeVisible({ timeout: 5000 });
    const toggle = row.locator('input.code-switcher');
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

    const dbResult = await queryDb(`SELECT IsDelete FROM Master_PartGroup WHERE PartGrp = '${itemGroupName}'`);
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

test('deactivate item group by name and verify DB', async({page}) => {
    const itemGroupName = itemGroupData.deactiveitem; 
    await gotoItemGroup(page);
    await toggleItemGroup(page, itemGroupName, 'deactivate');
    await page.waitForTimeout(2000);
});

test('activate item group by name and verify DB', async({page}) => {
    const itemGroupName = itemGroupData.activeitem; 
    await gotoItemGroup(page);
    await toggleItemGroup(page, itemGroupName, 'activate');
    await page.waitForTimeout(2000);
});
