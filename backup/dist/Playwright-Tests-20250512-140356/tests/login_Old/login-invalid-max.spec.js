"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
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
(0, test_1.test)('login with various invalid credentials in one session', async ({ page }) => {
    await page.goto('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login', { timeout: 90000 });
    for (const creds of invalidCredentials) {
        await page.getByRole('textbox', { name: 'Enter Username' }).fill(creds.username);
        await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
        await page.getByRole('button', { name: /Log In/i }).click();
        await page.waitForTimeout(9000);
        await (0, test_1.expect)(page).toHaveURL('https://swtest.craftsmanautomation.com:8090/wms-milkymist/web/auth/login');
        await page.getByRole('textbox', { name: 'Enter Username' }).fill('');
        await page.getByRole('textbox', { name: 'Enter Password' }).fill('');
    }
});
//# sourceMappingURL=login-invalid-max.spec.js.map