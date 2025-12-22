import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { itemGroupData } from '../../../testData/ItemGroupData';
import { queryDb } from '../../../Database/db';

//test('Add multiple Item Groups and verify record count', async ({ page }) => {

  async function gotoItemGroup(page: any) {
  
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Item Group/i }).click();
  await page.waitForURL(/itemgroup/i);
  await expect(page).toHaveURL(/itemgroup/i);
  }

  async function getItemGroupCountFromDb(): Promise<number> {
    const result = await queryDb('SELECT COUNT(*) AS count FROM Master_PartGroup WITH(NOLOCK) WHERE IsDelete = 0');
    return result[0].count;
  }

async function additemgroup(page:any, itemgroupname:string, itemgroupdesc:string) {
    await page.getByRole('button', { name: new RegExp(itemGroupData.addButton, 'i') }).click();
    await page.waitForURL(/itemgroup/i);
    await expect(page).toHaveURL(/itemgroup/i);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const allTextboxes = page.locator('input[type="text"]:visible');
    await expect(allTextboxes.nth(0)).toBeVisible({ timeout: 5000 });
    await expect(allTextboxes.nth(1)).toBeVisible({ timeout: 5000 });
    await allTextboxes.nth(0).fill(itemgroupname);
    await allTextboxes.nth(1).fill(itemgroupdesc);
    await page.getByRole('button', { name: new RegExp(itemGroupData.SubmitButton, 'i') }).click();
    let handledPopup = false;
    try {
      const errorPopup = page.locator(`div.modal-body:has-text("${itemGroupData.errorPopupText}")`);
      await errorPopup.waitFor({ state: 'visible', timeout: 3000 });
      const okBtn = errorPopup.locator('button.swal2-cancel, button.btn-primary');
      if (await okBtn.isVisible()) {
        await okBtn.click();
        handledPopup = true;
        console.log(`Item Group ${itemgroupname} already exists.`);
        await page.reload();
        return;
      }
    } catch {
    }
    if (!handledPopup) {
      await page.waitForTimeout(2000);
      console.log(` Item Group ${itemgroupname} added successfully.`);
    }
    const dbResult = await queryDb(`SELECT PartGrp, PartGrpDesc FROM Master_PartGroup WHERE PartGrp = '${itemgroupname}'`);
    expect(dbResult.length).toBeGreaterThan(0);
    expect(dbResult[0].PartGrp).toBe(itemgroupname);
    expect(dbResult[0].PartGrpDesc).toBe(itemgroupdesc);
    console.log(`Item Group ${itemgroupname} verified in DB.`);  
}
test('Add multiple Item Groups and verify record count', async ({ page }) => {
  await gotoItemGroup(page);
  for (let i = 1; i <= itemGroupData.itemgroupcount; i++) {
    await additemgroup(page, `${itemGroupData.itemGroupdesc}${i}`, `${itemGroupData.itemGroupdesc}${i}`);
  }
  const dbCount = await getItemGroupCountFromDb();
  const uiCountText = await page.locator('div.record-count').innerText();
  const uiCountMatch = uiCountText.match(/Total Records:\s*(\d+)/i);
  let uiCount = 0;
  if (uiCountMatch) {
    uiCount = parseInt(uiCountMatch[1], 10);
  }
  expect(uiCount).toBe(dbCount);
  console.log(`UI count (${uiCount}) matches DB count (${dbCount}).`);
});