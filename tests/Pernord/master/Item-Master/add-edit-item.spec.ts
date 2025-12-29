import {test, expect, Page} from '@playwright/test';
import {loginData} from '@testData/loginData';
import {ItemMasterData} from '@testData/Pernord/Item-MasterData';
//import {queryDb} from '@database/db';

async function gotoItemMaster(page: any) {
    await page.goto(loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', {name: 'Enter Username'}).fill(loginData.username);
    await page.getByRole('textbox', {name: 'Enter Password'}).fill(loginData.password);
    await page.getByRole('button', {name: /Log In/i}).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.locator('a.is-parent', { hasText: 'Master' }).click();
    await page.waitForTimeout(500);
    //await page.getByRole('link', {name: /Item Master/i}).click();
    await page.locator('a.nav-link.submenu', { hasText: 'Item Master' }).click();
    await page.waitForURL(loginData.baseUrl + 'master/itemmaster');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/itemmaster');
}

async function addItem(page: any, itemcode: string, itemName: string, itemdesc: string, itemgroup: string, uom: string,sku:string,packagingsize:string,itemsize:string,expiryDuration:string) {
    await page.getByRole('button', {name: new RegExp(ItemMasterData.addButton, 'i')}).click();
    await page.waitForURL(/itemmaster\/add/i);
    await expect(page).toHaveURL(/itemmaster\/add/i);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const allTextboxes = page.locator('input[type="text"]:visible');
    await expect(allTextboxes.nth(0)).toBeVisible({timeout: 5000});
    await allTextboxes.nth(0).fill(itemcode);
    await allTextboxes.nth(1).fill(itemName);
    await allTextboxes.nth(2).fill(itemdesc);
    await page.getByLabel(new RegExp(ItemMasterData.itemnamelabel, 'i')).selectOption({label: itemgroup});
    await page.getByLabel(/UOM/i).selectOption({label: uom});
    await allTextboxes.nth(3).fill(sku);
    await allTextboxes.nth(4).fill(packagingsize);
    await allTextboxes.nth(5).fill(itemsize);
    await allTextboxes.nth(6).fill(expiryDuration);
    await page.getByRole('button', {name: new RegExp(ItemMasterData.SubmitButton, 'i')}).click();
    let handledPopup = false;
    try {
        const errorPopup = page.locator(`div.modal-body:has-text("${ItemMasterData.errorPopupText}")`);
        await errorPopup.waitFor({state: 'visible', timeout: 3000});
        const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
        if (await okBtn.isVisible()) {
            await okBtn.click();
            // const dbResult = await queryDb(`SELECT ItemName FROM Item_Master WHERE ItemName = '${itemName}'`);
            // expect(dbResult.length).toBeGreaterThan(0);
            // expect(dbResult[0].ItemName).toBe(itemName);
            // console.log(`Item ${itemName} already exists. Verified in DB.`);
            handledPopup = true;
            await page.reload();
            return;
        }
    } catch {

    }
    if (!handledPopup) {
        await page.waitForTimeout(2000);
        console.log(` Item ${itemName} added successfully.`);
    }
    // const dbResult = await queryDb(`SELECT ItemName FROM Item_Master WHERE ItemName = '${itemName}'`);
    // expect(dbResult.length).toBeGreaterThan(0);
    // expect(dbResult[0].ItemName).toBe(itemName);
    // console.log(`Item ${itemName} verified in DB.`);
}

async function editItem(page: Page, oldItemName: string, newItemDesc: string) {
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    const searchBox = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchBox.count() > 0) {
        await searchBox.fill(oldItemName);
        await page.waitForTimeout(1000);
    }
    const itemRow = page.locator('table tbody tr', { hasText: oldItemName }).first();
    await expect(itemRow).toBeVisible({ timeout: 10000 });
    const editBtn = itemRow.locator('button.edit-item-btn');
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const descTextbox = dialog.locator('input[type="text"]:visible').nth(2);
    await descTextbox.fill(newItemDesc);
    const updateBtn = dialog.locator('button.btn-primary');
    await updateBtn.click();
    console.log(`Item "${oldItemName}" edited successfully.`);
}

test.describe('Item Master Tests', () => {
    test.beforeEach(async ({page}) => {
        await gotoItemMaster(page);
    }); 

    test('Edit Item Test', async ({page}) => {
        const oldItemName = `${ItemMasterData.itemnamePrefix}${ItemMasterData.editItem}`;
        const newItemDesc = ItemMasterData.editItemdesc;
        await editItem(page, oldItemName, newItemDesc);
    });
});
