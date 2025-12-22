"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)('has title', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await (0, test_1.expect)(page).toHaveTitle(/Playwright/);
});
(0, test_1.test)('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await page.getByRole('link', { name: 'Get started' }).click();
    await (0, test_1.expect)(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
//# sourceMappingURL=example.spec.js.map