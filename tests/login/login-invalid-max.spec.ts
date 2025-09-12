import { test, expect } from '@playwright/test';

const invalidCredentials = [
  { username: '', password: '' },
  { username: 'invaliduser', password: 'invalidpass' },
  { username: 'admisn', password: 'wrongpassword' },
  { username: 'user!@#$', password: 'pass!@#$' },
  { username: 'a'.repeat(50), password: 'b'.repeat(50) },
  { username: '1234567890', password: '0987654321' },
  { username: 'test@example.com', password: 'test1234' },
  { username: 'null', password: 'undefined' },
];

test('login with various invalid credentials in one session', async ({ page }) => {
  await page.goto('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login', { timeout: 90000 });

  for (const creds of invalidCredentials) {
    // Fill username and password
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(creds.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForTimeout(9000); // wait for response
    // Assert still on login page
    await expect(page).toHaveURL('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login');
    // Optionally clear fields for next iteration
    await page.getByRole('textbox', { name: 'Enter Username' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Password' }).fill('');
  }
});

/*
test('login with maximum length credentials', async ({ page }) => {
  await page.goto('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login', { timeout: 60000 });
    const maxUsername = 'a'.repeat(100); // assuming 100 is max length
    const maxPassword = 'b'.repeat(100); // assuming 100 is max length
    // Fill username and password
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(maxUsername);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(maxPassword);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForTimeout(2000); // wait for response
    // Assert still on login page
    await expect(page).toHaveURL('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login');   
    // Optionally clear fields for next iteration
    await page.getByRole('textbox', { name: 'Enter Username' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Password' }).fill('');
});*/