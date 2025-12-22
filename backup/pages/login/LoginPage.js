"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
class LoginPage {
    page;
    usernameInput;
    passwordInput;
    loginButton;
    clearButton;
    passwordVisibilityToggle;
    errorMessageContainer;
    successIndicator;
    passwordEye;
    constructor(page) {
        this.page = page;
        this.usernameInput = page.getByRole('textbox', { name: /Enter Username/i });
        this.passwordInput = page.getByRole('textbox', { name: /Enter password/i }).or(page.locator('input[type="password"]'));
        this.loginButton = page.getByRole('button', { name: /log in|login|sign in/i });
        this.clearButton = page.getByRole('button', { name: /clear/i });
        this.passwordVisibilityToggle = page.locator('button[aria-label*="password"], .password-toggle, i.ri-eye-line, i.ri-eye-off-line').first();
        //this.errorMessageContainer = page.locator('[class*="error"], [class*="alert"], .error-message, .alert-danger');
        this.errorMessageContainer = page.locator(`
  [class*="error"]:visible,
  [class*="alert"]:visible,
  .error-message:visible,
  .alert-danger:visible,
  .text-danger:visible,
  [role="alert"]:visible,
  .toast-error:visible,
  .notification-error:visible
`);
        this.successIndicator = page.locator('[class*="success"], .dashboard-welcome');
        this.passwordEye = page.locator('i.ri-eye-line, i.ri-eye-off-line, button[aria-label*="eye"]').first();
    }
    async navigate(baseUrl) {
        await this.page.goto(`${baseUrl}auth/login`);
    }
    async enterUsername(username) {
        await this.usernameInput.fill(username);
    }
    async enterPassword(password) {
        await this.passwordInput.fill(password);
    }
    async clickLogin() {
        await this.loginButton.click();
        await this.page.waitForTimeout(2000);
    }
    // Getters for test assertions
    getUsernameInput() {
        return this.usernameInput;
    }
    getPasswordInput() {
        return this.passwordInput;
    }
    getLoginButton() {
        return this.loginButton;
    }
    getClearButton() {
        return this.clearButton;
    }
    getErrorMessageContainer() {
        return this.errorMessageContainer;
    }
    getSuccessIndicator() {
        return this.successIndicator;
    }
    // Method to wait for login success (without assertions)
    async waitForLoginSuccess(timeout = 10000) {
        try {
            // Wait for URL change or success indicator
            await this.page.waitForURL('**/dashboard', { timeout });
            return true;
        }
        catch {
            return false;
        }
    }
    // Method to check if error message is visible
    async isErrorMessageVisible(timeout = 5000) {
        try {
            await this.errorMessageContainer.waitFor({ state: 'visible', timeout });
            return true;
        }
        catch {
            return false;
        }
    }
    // Method to get error message text
    async getErrorMessageText() {
        if (await this.errorMessageContainer.isVisible()) {
            const errorText = await this.errorMessageContainer.textContent();
            return errorText?.trim() || 'Unknown error';
        }
        return '';
    }
    async clearInputs() {
        await this.usernameInput.clear();
        await this.passwordInput.clear();
    }
    async clickClearButton() {
        if (await this.clearButton.isVisible()) {
            await this.clearButton.click();
        }
    }
    async togglePasswordVisibility() {
        if (await this.passwordVisibilityToggle.isVisible()) {
            await this.passwordVisibilityToggle.click();
            await this.page.waitForTimeout(500);
        }
    }
    async isPasswordMasked() {
        const type = await this.passwordInput.getAttribute('type');
        return type === 'password';
    }
    async getUsernameValue() {
        return await this.usernameInput.inputValue();
    }
    async getPasswordValue() {
        return await this.passwordInput.inputValue();
    }
    async isLoginButtonEnabled() {
        return await this.loginButton.isEnabled();
    }
    async isUsernameEmpty() {
        const value = await this.getUsernameValue();
        return !value || value.length === 0;
    }
    async isPasswordEmpty() {
        const value = await this.getPasswordValue();
        return !value || value.length === 0;
    }
    // Helper method to check if page is loaded
    async isPageLoaded() {
        return await this.usernameInput.isVisible() &&
            await this.passwordInput.isVisible() &&
            await this.loginButton.isVisible();
    }
    // Method to get password placeholder text
    async getPasswordPlaceholder() {
        return await this.passwordInput.getAttribute('placeholder');
    }
    // Method to perform complete login
    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }
}
exports.LoginPage = LoginPage;
