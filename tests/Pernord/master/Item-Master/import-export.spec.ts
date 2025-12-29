import {test,expect,Page} from '@playwright/test';
import {loginData} from '@testData/loginData';
//import {queryDb} from '@database/db';
import {readExcel} from '../../../../utils/excelUtils';
import path from 'path';

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

async function downloadFile(page: Page, buttonText: string, fileExtension: string) {
    const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
    await exportBtn.click();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('a.dropdown-item', { hasText: buttonText }).click(),
    ]);
    const filePath = `./Downloads/ItemMaster_${Date.now()}.${fileExtension}`;
    await download.saveAs(filePath);
    console.log(`${buttonText} downloaded at:`, filePath);
    return filePath;
}

test('Item Master - Export Excel/CSV', async ({page}) => {
    await gotoItemMaster(page);
    await downloadFile(page, 'EXCEL', 'xlsx');
    await downloadFile(page, 'CSV', 'csv');
    //await downloadFile(page, 'PDF', 'pdf');
    await page.waitForTimeout(2000);
});

test('Item Master - Download Sample Import File', async ({page}) => {
    await gotoItemMaster(page);

    await page.getByRole('button', {name: /Import/i}).click();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', {name: /Sample Download/i}).click()
    ]);
    const downloadPath = path.join(__dirname, '../../../downloads', await download.suggestedFilename());
    await download.saveAs(downloadPath);
    console.log('Sample file downloaded to:', downloadPath);
});

test('Item Master - Import Items from Excel', async ({page}) => {
    await gotoItemMaster(page);

    await page.getByRole('button', {name: /Import/i}).click();
    // const importFilePath = path.resolve(__dirname, '../../../testData/Pernord/import.xlsx');
    // await page.getByLabel('Upload Excel File').setInputFiles(importFilePath);
    const importFilePath = path.resolve(process.cwd(),'testData/Pernord/import.xlsx');
    await page.getByLabel('Upload Excel File').setInputFiles(importFilePath);
    await page.waitForTimeout(2000);
    await expect(page.getByText('Product List Preview Page')).toBeVisible();
    await page.getByRole('button', {name: 'Verify & Confirm'}).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', {name: 'Import'}).click();
    await page.waitForTimeout(3000);
    // // Verify data in DB
    // const excelData = readExcel(importFilePath, 'ItemMaster');
    // for (const row of excelData) {
    //     const itemCode = row['Item Code'];
    //     const query = `SELECT * FROM item_master WHERE item_code = '${itemCode}'`;
    //     const result = await queryDb(query);
    //     expect(result.length).toBeGreaterThan(0);
    //     expect(result[0].item_name).toBe(row['Item Name']);
    //     expect(result[0].item_description).toBe(row['Item Description']);
    // }
    // console.log('Item Master import and DB verification completed.');
});

test('Item Master - Import with Duplicate Items', async ({page}) => {
    await gotoItemMaster(page);
    await page.getByRole('button', {name: /Import/i}).click();
    // const importFilePath = path.resolve(__dirname, '../../../testData/Pernord/import.xlsx');
    // await page.getByLabel('Upload Excel File').setInputFiles(importFilePath);
    const importFilePath = path.resolve(process.cwd(),'testData/Pernord/import.xlsx');
    await page.getByLabel('Upload Excel File').setInputFiles(importFilePath);
    await page.waitForTimeout(2000);
    await expect(page.getByText('Product List Preview Page')).toBeVisible();
    await page.getByRole('button', {name: 'Verify & Confirm'}).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', {name: 'Import'}).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Item already exists')).toBeVisible();
    await page.getByRole('button', {name: /OK/i}).click();
    console.log('Duplicate item import test completed.');
});