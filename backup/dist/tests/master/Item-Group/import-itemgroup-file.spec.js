"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const loginData_1 = require("../../../testData/loginData");
const path = __importStar(require("path"));
(0, test_1.test)('import itemgroup file and verify import', async ({ page }) => {
    await page.goto(loginData_1.loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter UserName' }).fill(loginData_1.loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData_1.loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData_1.loginData.baseUrl);
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl);
    await page.getByRole('link', { name: /master/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Group/i }).click();
    await page.waitForURL(/itemGroup/i);
    await (0, test_1.expect)(page).toHaveURL(/itemGroup/i);
    await page.waitForURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
    await (0, test_1.expect)(page).toHaveURL(loginData_1.loginData.baseUrl + 'master/itemGroup');
    await page.getByRole('button', { name: /Import/i }).click();
    const [Download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /Sample Download/i }).click()
    ]);
    const downloadPath = path.join(__dirname, '../../../downloads', await Download.suggestedFilename());
    await Download.saveAs(downloadPath);
    console.log('File downloaded to:', downloadPath);
    await page.waitForTimeout(2000);
});
//# sourceMappingURL=import-itemgroup-file.spec.js.map