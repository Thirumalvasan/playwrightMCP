import { test, expect, Page } from '@playwright/test';
import { loginData } from '../../../testData/loginData';

async function login(page: Page): Promise<void> {
  await page.goto(`${loginData.baseUrl}auth/login`);
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl, { timeout: 15000 });
  await expect(page).toHaveURL(loginData.baseUrl);
}

async function gotoReports(page: Page): Promise<void> {
  await page.getByRole('link', { name: /reports/i }).click();
  await page.waitForTimeout(5000);
}

async function gotoItemTransaction(page: Page): Promise<void> {
  await page.getByRole('link', { name: /Item Transaction/i }).click();
  await page.waitForURL(new RegExp(`${loginData.baseUrl.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}.*item`), { timeout: 20000 });
}

async function clickAllColumnSorts(page: Page): Promise<void> {
  const sortIcons = page.locator('table thead th i[name="sorticon"], i[name="sorticon"]');
  const count = await sortIcons.count();
  for (let i = 0; i < count; i++) {
    const icon = sortIcons.nth(i);
    try {
      if (await icon.isVisible()) {
        await icon.click({ timeout: 3000 });
        await page.waitForTimeout(800);
        await icon.click({ timeout: 3000 });
        await page.waitForTimeout(800);
        console.log(`Clicked sort icon ${i+1}/${count}`);
      }
    } catch (e) {
      console.warn(`Sort icon ${i} not clickable: ${e}`);
    }
  }
}

async function handleDateFilter(page: Page): Promise<void> {
  const toggle = page.locator('label.dropdown-toggle.form-select2, label.dropdown-toggle').first();
  if (await toggle.count() && await toggle.isVisible()) {
    await toggle.click();
    await page.waitForTimeout(500);
    await page.locator('body').click({ position: { x: 10, y: 10 } });
  } else {
    console.warn('Date filter toggle not found');
  }
}

test('Item-Trans: login -> reports -> item transaction -> sort columns', async ({ page }) => {
  await login(page);
  await gotoReports(page);
  await gotoItemTransaction(page);
  await expect(page).toHaveURL(new RegExp('item', 'i'));
  await handleDateFilter(page);
  await clickAllColumnSorts(page);
});
