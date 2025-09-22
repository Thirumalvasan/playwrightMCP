import { test, expect } from '@playwright/test';
import { loginData } from '../../../testData/loginData';

test('item group export Excel, CSV, PDF', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);

  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: /Item Group/i }).click();
  await page.waitForURL(loginData.baseUrl + 'master/itemGroup');
  await expect(page).toHaveURL(loginData.baseUrl + 'master/itemGroup');

  const exportBtn = page.locator('button#dropdownMenuButton2.btn-outline-primary');

  async function downloadFile(buttonText: string, fileExtension: string) {
    await exportBtn.click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a.dropdown-item', { hasText: buttonText }).click(),
    ]);
    const filePath = `./Downloads/ItemGroup_${Date.now()}.${fileExtension}`;
    await download.saveAs(filePath);
    console.log(`${buttonText} downloaded at:`, filePath);
  }

  await downloadFile('EXCEL', 'xlsx');

  await downloadFile('CSV', 'csv');
  
  await page.waitForTimeout(2000);
});
