import { test, expect, Page } from '@playwright/test';
import { loginData } from '@testData/loginData';
import { UomMasterUtils } from '../../../../utils/UomMasterUtils';
import { UomMasterData } from '@testData/Uom-MasterData';

test('UOM Sorting and Filtering', async ({ page }) => {
  await login(page);
  await gotoUomMaster(page);

  const uomUtils = new UomMasterUtils(page);

  // sorting tests
  await uomUtils.toggleUomSortingASC();
  await uomUtils.toggleUomSortingDESC();
  await uomUtils.toggleTimestampSortingASC();
  await uomUtils.toggleTimestampSortingDESC();

  // filter test
  await testFilterFunctionality(page, uomUtils);
});


/* -------------------------------------------------------------------------- */
/*                               FILTER TEST                                   */
/* -------------------------------------------------------------------------- */

async function testFilterFunctionality(page: Page, uomUtils: UomMasterUtils) {

  const filterValue = UomMasterData.FilterUomName[0];
  console.log(`Applying filter for UOM: "${filterValue}"`);

  const initialRows = await page.locator('table tbody tr').count();
  console.log(`Initial row count: ${initialRows}`);

  await uomUtils.filterByUomName(filterValue);

  await waitForFilterToApply(page);
  await debugTableContents(page);

  const firstRowValue = await page.locator('table tbody tr:first-child td:nth-child(1)').innerText();
  console.log(`Filtered first row: "${firstRowValue}"`);

  expect(firstRowValue).toContain(filterValue);

  const filteredRows = await page.locator('table tbody tr').count();
  console.log(`Filtered row count: ${filteredRows}`);

  expect(filteredRows).toBeGreaterThan(0);

  // clear filter
  await clearFilter(page, uomUtils);
  await page.waitForTimeout(800);

  const finalRows = await page.locator('table tbody tr').count();
  console.log(`Final row count after clearing filter: ${finalRows}`);

  expect(finalRows).toBe(initialRows);
}


/* -------------------------------------------------------------------------- */
/*                          WAIT FOR FILTER APPLY                              */
/* -------------------------------------------------------------------------- */

async function waitForFilterToApply(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  try {
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
  } catch {
    console.log('âš  No table rows found after filter â€” possibly zero results');
  }

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('table tbody tr');
    if (rows.length === 0) return true; // zero results scenario

    const first = document.querySelector('table tbody tr:first-child td:nth-child(1)');
    return first && first.textContent?.trim().length! > 0;
  }, { timeout: 8000 });
}


/* -------------------------------------------------------------------------- */
/*                         DEBUG TABLE CONTENTS                                */
/* -------------------------------------------------------------------------- */

async function debugTableContents(page: Page) {
  console.log('===== TABLE DEBUG START =====');

  const rows = await page.locator('table tbody tr').count();
  console.log(`Row count: ${rows}`);

  if (rows > 0) {
    const firstRow = await page.locator('table tbody tr:first-child td').allInnerTexts();
    console.log('First row data:', firstRow);

    const allFirstCol = await page.locator('table tbody tr td:nth-child(1)').allInnerTexts();
    console.log('All UOM column values:', allFirstCol);
  } else {
    console.log('âš  Table has no rows.');
  }

  console.log('===== TABLE DEBUG END =====');
}


/* -------------------------------------------------------------------------- */
/*                             CLEAR FILTER                                    */
/* -------------------------------------------------------------------------- */

async function clearFilter(page: Page, uomUtils: UomMasterUtils) {
  console.log('Clearing filter...');

  try {
    if (uomUtils.clearFilter) {
      await uomUtils.clearFilter();
    } else {
      await page.getByPlaceholder('Search...').fill('');
      await page.getByPlaceholder('Search...').press('Enter');
    }
  } catch {
    console.log('Fallback: page reload to clear filter');
    await page.reload();
    await page.waitForSelector('table tbody tr');
  }
}


/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                     */
/* -------------------------------------------------------------------------- */

async function login(page: Page) {
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
  await page.getByRole('button', { name: /Log In/i }).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);
}


/* -------------------------------------------------------------------------- */
/*                            NAVIGATE TO UOM                                  */
/* -------------------------------------------------------------------------- */

async function gotoUomMaster(page: Page) {
  await page.getByRole('link', { name: /master/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole('link', { name: /UOM Master/i }).click();
  await page.waitForURL(loginData.baseUrl + 'master/uom');
  await expect(page).toHaveURL(loginData.baseUrl + 'master/uom');
}

