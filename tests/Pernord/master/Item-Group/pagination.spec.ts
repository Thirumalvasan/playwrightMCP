import {test,expect} from '@playwright/test';
import { loginData } from '@testData/loginData';

function getTimeString (date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

test('item group pagination and refresh tests', async ({ page }) => {
    test.setTimeout(70000);

    await page.goto(loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData.username);
    await page.getByRole('textbox',{name:'Enter Password'}).fill(loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    
    await page.getByRole('link',{name:/master/i}).click();
    await page.waitForTimeout(500);
    await page.getByRole('link',{name:/Item Group/i}).click();
    await page.waitForURL(loginData.baseUrl +'master/itemGroup');
    await expect(page).toHaveURL(loginData.baseUrl +'master/itemGroup');

    const lastPageBtn = page.getByRole('link', { name: /\d+/, exact: false }).last();
    await lastPageBtn.click();
    await page.waitForTimeout(1500);
    const lastPageRow = page.locator('table tbody tr');
    await expect(lastPageRow.first()).toBeVisible({ timeout: 5000 });
    const timeAfterLastPage = getTimeString(new Date());
    console.log('Last page data loaded at:', timeAfterLastPage);
    const firstPageBtn = page.getByRole('link', { name: '1', exact: true }).first();
    await firstPageBtn.click();
    await page.waitForTimeout(1500);
    const firstPageRow = page.locator('table tbody tr');
    await expect(firstPageRow.first()).toBeVisible({ timeout: 5000 });
    const timeAfterFirstPage = getTimeString(new Date());
    console.log('First page data loaded at:', timeAfterFirstPage);

    const nextBtn = page.locator('a.page-link[aria-label="Next"]');
    await nextBtn.click();
    await page.waitForTimeout(1500);
    const nextPageRow = page.locator('table tbody tr');
    await expect(nextPageRow.first()).toBeVisible({ timeout: 5000 });
    const timeAfterNextPage = getTimeString(new Date());
    console.log('Next page data loaded at:', timeAfterNextPage);

    const prevBtn = page.locator('a.page-link[aria-label="Previous"]');
    await prevBtn.click();
    await page.waitForTimeout(1500);
    const prevPageRow = page.locator('table tbody tr');
    await expect(prevPageRow.first()).toBeVisible({ timeout: 5000 });
    const timeAfterPrevPage = getTimeString(new Date());
    console.log('Previous page data loaded at:', timeAfterPrevPage);

    const refreshBtn = page.locator('span#basic-addon1.input-group-text.refresh');
    await refreshBtn.click();
    await page.waitForTimeout(1000);
    const timeAfterRefresh = getTimeString(new Date());
    console.log('Refreshed data loaded at:', timeAfterRefresh);

    await page.waitForTimeout(30000);
}
);

