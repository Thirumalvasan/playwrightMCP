// tests/verify-setup.spec.ts
import { test, expect } from '@playwright/test';
import { loginData } from '@testData/loginData';

test('Verify multi-project setup is working', async ({ page }) => {
  console.log('=== PROJECT SETUP VERIFICATION ===');
  console.log(`Current Project: ${loginData.project}`);
  console.log(`Base URL: ${loginData.baseUrl}`);
  console.log(`Username: ${loginData.username}`);
  console.log('==================================');
  
  // Just visit the base URL
  await page.goto(loginData.baseUrl);
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log(`Page Title: ${title}`);
  
  // Take screenshot for verification
  await page.screenshot({ path: `setup-verification-${loginData.project}.png` });
  console.log('✓ Screenshot saved');
});