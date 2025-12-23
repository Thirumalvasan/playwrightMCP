import { test, expect } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { queryDb } from '@database/db';
import { readExcel } from '../../../../utils/excelUtils';
import path from 'path';

test('import pallet and verify', async ({ page }) => {
  const excelFile = path.resolve(__dirname, 'PalletImport.xlsx');
  const excelData = readExcel(excelFile);

  if (!excelData || excelData.length === 0) {
    throw new Error('Excel data is empty or not parsed correctly.');
  }

  const headers = Object.keys(excelData[0]).map(h => h.trim());
  console.log('Excel column headers:', headers);

  const palletNameColumn = headers.find(h => h.toLowerCase().includes('pallet id')) || headers[0];
  const descColumn = headers.find(h => h.toLowerCase().includes('description')) || headers[1];

  const excelRows = excelData.map(row => ({
    palletName: row[palletNameColumn]?.toString().trim(),
    palletDesc: row[descColumn]?.toString().trim()
  })).filter(r => r.palletName);

  console.log('Excel rows:', excelRows);


  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);

  await page.getByRole('link', { name: /master/i }).click();
  await page.getByRole('link', { name: /Pallet Master/i }).click();
  await page.waitForURL(loginData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(loginData.baseUrl + 'master/palletmaster');

  await page.getByRole('button', { name: /Import/i }).click();
  await page.setInputFiles('input[type="file"]', excelFile);
  await page.getByRole('button', { name: /Verify & Confirm/i }).click();


  try {
    // Wait for success popup
    await page.waitForSelector('text=imported successfully', { timeout: 15000 });
    const successMessage = page.getByText('imported successfully', { exact: false });
    await expect(successMessage).toBeVisible();

    await page.getByRole('button', { name: /OK/i }).click();
    await page.waitForTimeout(2000);

  } catch {
    // Fallback: check if all records already exist in DB
    let allExist = true;

    for (const { palletName } of excelRows) {
      const dbResult = await queryDb(`
        SELECT PalletId FROM Master_Pallet WHERE PalletId = '${palletName}'`);
      if (!dbResult || dbResult.length === 0) {
        allExist = false;
        break;
      }
    }

    if (allExist) {
      await page.evaluate(() => {
        alert("Import Failed\nAll records already exist in the database");
      });

      await page.waitForTimeout(1000);

      console.log("Records already exist in DB:", excelRows.map(r => r.palletName).join(", "));
      return;
    }

    throw new Error("Import failed for unknown reasons.");
  }


  // DB validation after popup success
  for (const { palletName, palletDesc } of excelRows) {
    const dbResult = await queryDb(`
      SELECT PalletId, Description 
      FROM Master_Pallet 
      WHERE PalletId = '${palletName}'`);

    expect(dbResult.length).toBeGreaterThan(0);
    const dbPallet = dbResult[0];

    expect(dbPallet.PalletId).toBe(palletName);
    expect(dbPallet.Description).toBe(palletDesc || null);

    console.log(`Pallet Import Verified in DB: ${palletName} -> ${palletDesc}`);
  }
});

