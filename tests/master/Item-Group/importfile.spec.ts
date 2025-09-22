import { test, expect} from '@playwright/test';
import { loginData } from '../../../testData/loginData';
import { itemGroupData } from '../../../testData/ItemGroupData';

test('import itemgroup file and verify import', async ({ page }) => {
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(/itemGroup/i);
    await expect(page).toHaveURL(/itemGroup/i);
    await page.waitForURL(loginData.baseUrl + 'master/itemGroup');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/itemGroup');
    await page.getByRole('button', { name: /Import/i }).click();

    await page.setInputFiles('input[type="file"]', 'tests/master/Item-Group/ItemGroupImport.xlsx');
    await page.getByRole('button', { name: /Verify & Confirm/i }).click();
    const successMessage = page.locator('div.modal-body:has-text("Import Successful")');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(2000);
});