import {test, expect} from '@playwright/test';
import {loginData} from '../../../testData/loginData';
import {itemGroupData} from '../../../testData/ItemGroupData'
import {queryDb} from '../../../Database/db';

test('Edit an Item Group and verify the update', async ({page}) => {

    await page.goto(loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox',{name:'Enter Username'}).fill(loginData.username);
    await page.getByRole('textbox',{name:'Enter Password'}).fill(loginData.password);
    await page.getByRole('button', {name: /Log In/i}).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);

    await page.getByRole('link', {name: /master/i}).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', {name: /Item Group/i}).click();

    const secondeditIcon = page.locator('li.edit button.edit-item-btn').nth(1);
    await secondeditIcon.click();
    await page.waitForURL(loginData.baseUrl + 'master/itemGroup');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/itemGroup');
    await page.getByRole('button', {name: /clear/i}).click();

    const itemGroupInput = page.locator('label.form-label', {hasText: 'Item Group'}).locator('xpath=following-sibling::input');
    await itemGroupInput.first().waitFor({state: 'visible', timeout: 10000});
    await itemGroupInput.first().fill(itemGroupData.editItemGroup);

    const descInput = page.locator('label.form-label', {hasText: 'Item Group Description'}).locator('xpath=following-sibling::input');
    await descInput.first().waitFor({state: 'visible', timeout: 10000});
    await descInput.first().fill(itemGroupData.editItemGroupdesc);
    const updateBtn = page.locator('button.btn-primary.btn-load');
    await updateBtn.click();
    await page.waitForTimeout(1000);
    await page.goto(loginData.baseUrl + 'master/itemGroup');
    await page.waitForTimeout(1000);
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await page.waitForTimeout(20000);
});