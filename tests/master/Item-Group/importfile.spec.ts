import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { queryDb } from '../../../Database/db';
import { readExcel } from '../../../utils/excelUtils';
import path from 'path';

test('import item group file and verify import', async ({ page }) => {
  const excelFile = path.resolve(__dirname, 'ItemGroupImport.xlsx');
  const excelData = readExcel(excelFile);

  if (!excelData || excelData.length === 0) {
    throw new Error('Excel data is empty or not parsed correctly.');
  }


  const headers = Object.keys(excelData[0]).map(h => h.trim());
  console.log('Excel column headers:', headers);

  const groupNameColumn = headers.find(h => h.toLowerCase().includes('item group')) || headers[0];
  const descColumn = headers.find(h => h.toLowerCase().includes('description')) || headers[1];

  
  const excelRows = excelData.map(row => ({
    groupName: row[groupNameColumn]?.toString().trim(),
    groupDesc: row[descColumn]?.toString().trim()
  })).filter(r => r.groupName);

  console.log('Excel rows:', excelRows);


  await page.goto(`${loginData.baseUrl}auth/login`);
  await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);

  await page.getByRole('link', { name: /master/i }).click();
  await page.getByRole('link', { name: /Item Group/i }).click();
  await page.waitForURL(`${loginData.baseUrl}master/itemGroup`);
  await expect(page).toHaveURL(`${loginData.baseUrl}master/itemGroup`);

  await page.getByRole('button', { name: /Import/i }).click();
  await page.setInputFiles('input[type="file"]', excelFile);
  await page.getByRole('button', { name: /Verify & Confirm/i }).click();

  await page.waitForSelector('text=imported successfully', { timeout: 15000 });
  const successMessage = page.getByText('imported successfully', { exact: false });
  await expect(successMessage).toBeVisible();

  // try {
  //   const modalText = await page.locator('div.modal-body').innerText();
  //   console.log('Modal text is:', modalText);
  // } catch {
  //   console.log('Modal body not found');
  // }

  await page.getByRole('button', { name: /OK/i }).click();
  await page.waitForTimeout(2000);

  for (const { groupName, groupDesc } of excelRows) {
    const dbRows = await queryDb(`
      SELECT PartGrp, PartGrpDesc 
      FROM Master_PartGroup 
      WHERE PartGrp = '${groupName}'
    `);

    expect(dbRows.length).toBeGreaterThan(0);
    expect(dbRows[0].PartGrp).toBe(groupName);

    if (groupDesc) {
      expect(dbRows[0].PartGrpDesc?.trim()).toBe(groupDesc);
    }

    console.log(`Verified in DB: ${groupName} -> ${groupDesc}`);
  }
});
