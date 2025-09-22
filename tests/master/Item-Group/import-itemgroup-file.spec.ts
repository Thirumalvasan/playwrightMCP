import {test, expect} from '@playwright/test';
import {loginData} from '../../../testData/loginData';
import {itemGroupData} from '../../../testData/ItemGroupData';
import * as path from 'path';

test('import itemgroup file and verify import', async ({page}) => {
  await page.goto(loginData.baseUrl + 'auth/login');
  await page.getByRole('textbox',{name:'Enter UserName'}).fill(loginData.username);
  await page.getByRole('textbox',{name:'Enter Password'}).fill(loginData.password);
  await page.getByRole('button',{name:/Log In/i}).click();
  await page.waitForURL(loginData.baseUrl);
  await expect(page).toHaveURL(loginData.baseUrl);

  await page. getByRole('link',{name:/master/i}).click();
  await page.waitForTimeout(500);
  await page.getByRole('link',{name:/Item Group/i}).click();
  await page.waitForURL(/itemGroup/i);
  await expect(page).toHaveURL(/itemGroup/i);

   await page.waitForURL(loginData.baseUrl + 'master/itemGroup');
    await expect(page).toHaveURL(loginData.baseUrl + 'master/itemGroup');
  

  await page.getByRole('button',{name:/Import/i}).click();

    // const filePath = itemGroupData.sampleFile;
    // const fileInput = page.locator('input[type="file"]');
    // await page.getByRole('button', { name: /Sample Download/i }).click();

   const [Download] = await Promise.all([
     page.waitForEvent('download'),
     page.getByRole('button', { name: /Sample Download/i }).click()
   ]);

  const downloadPath = path.join(__dirname, '../../../downloads', await Download.suggestedFilename());
  await Download.saveAs(downloadPath);
  console.log('File downloaded to:', downloadPath);

  await page.waitForTimeout(2000);

});

//UTIB0005149 
