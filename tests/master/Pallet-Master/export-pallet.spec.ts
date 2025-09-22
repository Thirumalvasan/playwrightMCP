// @ts-ignore
import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { palletMasterData } from '../../../testData/palletMasterData';

test('pallet master export PDF, Excel, CSV', async ({ page }) => {
  test.setTimeout(70000); // Allow for 1 min display
  // 1) Navigate to login page
  await page.goto(palletMasterData.baseUrl + 'auth/login');

  // 2) Enter the username
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);

  // 3) Enter the password
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);

  // 4) Click the login button
  await page.getByRole('button', { name: /Log In/i }).click();

  // 5) Check the url
  await page.waitForURL(palletMasterData.baseUrl);
  await expect(page).toHaveURL(palletMasterData.baseUrl);


  // 6) Click the master menu dropdown and select pallet master
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Pallet Master/i }).click();

  // 7) Check the url for palletmaster list page
  await page.waitForURL(palletMasterData.baseUrl + 'master/palletmaster');
  await expect(page).toHaveURL(palletMasterData.baseUrl + 'master/palletmaster');

  // 8) Click the export button
  const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');
  async function downloadFile(buttonText: string, fileExtension: string) {
    await exportBtn.click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a.dropdown-item', { hasText: buttonText }).click(),
    ]);
    const filePath = `./Downloads/PalletMaster_${Date.now()}.${fileExtension}`;
    await download.saveAs(filePath);
    console.log(`${buttonText} downloaded at:`, filePath);
  }

  await downloadFile('EXCEL', 'xlsx');

  await downloadFile('CSV', 'csv');

  await downloadFile('PDF', 'pdf');

  // Optional: wait to ensure all downloads complete
  await page.waitForTimeout(2000);
});
