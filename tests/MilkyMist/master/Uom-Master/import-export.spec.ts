import { test, expect, Page } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { queryDb } from '@database/db';
import { readExcel } from '../../../../utils/excelUtils';
import path from 'path';

async function login(page: Page) {
  await page.goto(`${loginData.baseUrl}auth/login`);
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);
}

async function gotoUomMaster(page: Page) {
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /UOM Master/i }).click();
  await page.waitForURL(`${loginData.baseUrl}master/uom`);
  await expect(page).toHaveURL(`${loginData.baseUrl}master/uom`);
}

async function downloadFile(page: Page, buttonText: string, fileExtension: string) {
  const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
  await exportBtn.click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('a.dropdown-item', { hasText: buttonText }).click(),
  ]);
  const filePath = `./Downloads/UOM_${Date.now()}.${fileExtension}`;
  await download.saveAs(filePath);
  console.log(`${buttonText} downloaded at:`, filePath);
  return filePath;
}

test('UOM Master - Export Excel/CSV', async ({ page }) => {
  await login(page);
  await gotoUomMaster(page);

  await downloadFile(page, 'EXCEL', 'xlsx');
  await downloadFile(page, 'CSV', 'csv');
  //await downloadFile(page, 'PDF', 'pdf');
  await page.waitForTimeout(2000);
});

test('UOM Master - Download Sample Import File', async ({ page }) => {
  await login(page);
  await gotoUomMaster(page);

  await page.getByRole('button', { name: /Import/i }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Sample Download/i }).click()
  ]);

  const downloadPath = path.join(__dirname, '../../../downloads', await download.suggestedFilename());
  await download.saveAs(downloadPath);
  console.log('Sample file downloaded to:', downloadPath);

  await page.waitForTimeout(2000);
});

test('UOM Master - Import and Verify DB', async ({ page }) => {
  const excelFile = path.resolve(__dirname, 'Sample UOM Master Download.xlsx');
  const excelData = readExcel(excelFile);

  if (!excelData || excelData.length === 0) {
    throw new Error('Excel data is empty or not parsed correctly.');
  }

  const headers = Object.keys(excelData[0]).map(h => h.trim());
  const uomNameColumn = headers.find(h => h.toLowerCase().includes('uom')) || headers[0];
  //const descColumn = headers.find(h => h.toLowerCase().includes('description')) || headers[1];

  const excelRows = excelData.map(row => ({
    uomName: row[uomNameColumn]?.toString().trim(),
   // uomDesc: row[descColumn]?.toString().trim()
  })).filter(r => r.uomName);

  console.log('Excel rows:', excelRows);

  await login(page);
  await gotoUomMaster(page);

  await page.getByRole('button', { name: /Import/i }).click();
  await page.setInputFiles('input[type="file"]', excelFile);
  await page.getByRole('button', { name: /Verify & Confirm/i }).click();

  let importSuccess = false;
  try {
    if (!importSuccess) {
  console.log("Import did not trigger popup, validating in DB instead");
}
    await page.waitForSelector('text=imported successfully', { timeout: 15000 });
    const successMessage = page.getByText('imported successfully', { exact: false });
    await expect(successMessage).toBeVisible();
    importSuccess = true;
    await page.getByRole('button', { name: /OK/i }).click();
    await page.waitForTimeout(2000);
  } catch {

    let allExist = true;
    for (const { uomName } of excelRows) {
      const dbRows = await queryDb(`SELECT UOM FROM UOM_Master WHERE Uom = '${uomName}'`);
      if (!dbRows || dbRows.length === 0) {
        allExist = false;
        break;
      }
    }
    if (allExist) {
      console.warn('Import skipped - All records already exist in DB.');
      return;
    } else {
      throw new Error('Import failed for unknown reasons.');
    }
  }

  for (const { uomName } of excelRows) {
    const dbRows = await queryDb(`SELECT Uom FROM UOM_Master WHERE Uom = '${uomName}'`);

    expect(dbRows.length).toBeGreaterThan(0);
    expect(dbRows[0].Uom).toBe(uomName);

    // if (uomDesc) {
    //   expect(dbRows[0].UomDesc?.trim()).toBe(uomDesc);
    //}

    console.log(`Verified in DB: ${uomName}`);
  }
});

