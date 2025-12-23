import { test, expect, Page } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { UomMasterData } from '@testData/Uom-MasterData';
import { queryDb } from '@database/db';


async function gotoUomMaster(page:any) {
    await page.goto(loginData.baseUrl+'auth/login');
    await page.getByRole('textbox',{name:'Enter Username'}).fill(loginData.username);
    await page.getByRole('textbox',{name:'Enter Password'}).fill(loginData.password);
    await page.getByRole('button',{name:/Log In/i}).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.getByRole('link',{name:/master/i}).click();
    await page.waitForTimeout(500);
    await page.getByRole('link',{name:/UOM Master/i}).click();
    await page.waitForURL(loginData.baseUrl+'master/uom');
    await expect(page).toHaveURL(loginData.baseUrl+'master/uom');
}
async function addUom(page:any, uomName: string) {

    await page.getByRole('button', { name: new RegExp(UomMasterData.addButton, 'i') }).click();
    await page.waitForURL(/uom/i);
    await expect(page).toHaveURL(/uom/i);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const allTextboxes = page.locator('input[type="text"]:visible');
    await expect(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
    await allTextboxes.nth(0).fill(uomName);
    await page.getByRole('button', { name: new RegExp(UomMasterData.SubmitButton, 'i') }).click();
    let handledPopup = false;
    try {
        const errorPopup = page.locator(`div.modal-body:has-text("UOM already exists")`);
        await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
        const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
        if (await okBtn.isVisible()) {
            await okBtn.click();

            const dbResult = await queryDb(`SELECT UOM FROM UOM_Master WHERE UOM = '${uomName}'`);
            expect(dbResult.length).toBeGreaterThan(0);
            expect(dbResult[0].UOM).toBe(uomName);
            console.log(`UOM ${uomName} already exists. Verified in DB.`);
            handledPopup = true;
            await page.reload();
            return;
        }
    } catch {
        
    }
    if (!handledPopup) {
        await page.waitForTimeout(2000);
        console.log(` UOM ${uomName} added successfully.`);
    }
    const dbResult = await queryDb(`SELECT UOM FROM UOM_Master WHERE UOM = '${uomName}'`);
    expect(dbResult.length).toBeGreaterThan(0);
    expect(dbResult[0].UOM).toBe(uomName);
    console.log(`UOM ${uomName} verified in DB.`);  
}

async function editUom(page: Page, oldUomName: string, newUomName: string) {
    const row = page.locator('table tbody tr', { hasText: oldUomName });
    await expect(row).toBeVisible({ timeout: 10000 });
    const editBtn = row.locator('li.edit button.edit-item-btn');
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const textbox = dialog.locator('input[type="text"]:visible').first();
    await textbox.fill(newUomName);
    const updateBtn = dialog.locator('button.btn.btn-primary.btn-load');
    await expect(updateBtn).toBeVisible({ timeout: 5000 });
    await updateBtn.click();
    await page.waitForTimeout(2000);
    console.log(`UOM ${oldUomName} â†’ ${newUomName} edited successfully.`);
    const dbResult = await queryDb(`SELECT UOM FROM UOM_Master WHERE UOM = '${newUomName}'`);
    expect(dbResult.length).toBeGreaterThan(0);
    expect(dbResult[0].UOM).toBe(newUomName);
    console.log(`UOM ${newUomName} verified in DB.`);
}


test('Add multiple UOM and verify in DB', async({page})=>{
    await gotoUomMaster(page);
    for(let i=0;i<UomMasterData.uomcount;i++){
        await addUom(page,UomMasterData.uomname[i]);
    }
});

test('Edit UOM and verify in DB', async({page})=>{
    await gotoUomMaster(page);
    await editUom(page,UomMasterData.oldUomName,UomMasterData.newUomName);
    await page.waitForTimeout(2000);

});
