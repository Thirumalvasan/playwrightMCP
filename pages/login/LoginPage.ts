import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;
  public usernameInput: Locator;
  public passwordInput: Locator;
  public loginButton: Locator;
  public clearButton: Locator;
  private passwordVisibilityToggle: Locator;
  private errorMessageContainer: Locator;
  private successIndicator: Locator;

  constructor(page: Page) {
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
    this.successIndicator = page.locator('[class*="success"], .dashboard-welcome');
  }
  async navigate(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/auth/login`);

  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Getters for test assertions
  getUsernameInput(): Locator {
    return this.usernameInput;
  }

  getPasswordInput(): Locator {
    return this.passwordInput;
  }

  getLoginButton(): Locator {
    return this.loginButton;
  }

  getClearButton(): Locator {
    return this.clearButton;
  }

  getErrorMessageContainer(): Locator {
    return this.errorMessageContainer;
  }

  getSuccessIndicator(): Locator {
    return this.successIndicator;
  }

  // Method to wait for login success (without assertions)
  async waitForLoginSuccess(timeout = 10000): Promise<boolean> {
    try {
      // Wait for URL change or success indicator
      await this.page.waitForURL('**/dashboard', { timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Method to check if error message is visible
  async isErrorMessageVisible(timeout = 5000): Promise<boolean> {
    try {
      await this.errorMessageContainer.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Method to get error message text
  async getErrorMessageText(): Promise<string> {
    if (await this.errorMessageContainer.isVisible()) {
      const errorText = await this.errorMessageContainer.textContent();
      return errorText?.trim() || 'Unknown error';
    }
    return '';
  }

  async clearInputs(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async clickClearButton(): Promise<void> {
    if (await this.clearButton.isVisible()) {
      await this.clearButton.click();
    }
  }

  async togglePasswordVisibility(): Promise<void> {
    if (await this.passwordVisibilityToggle.isVisible()) {
      await this.passwordVisibilityToggle.click();
      await this.page.waitForTimeout(500);
    }
  }

  async isPasswordMasked(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'password';
  }

  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async isUsernameEmpty(): Promise<boolean> {
    const value = await this.getUsernameValue();
    return !value || value.length === 0;
  }

  async isPasswordEmpty(): Promise<boolean> {
    const value = await this.getPasswordValue();
    return !value || value.length === 0;
  }

  // Helper method to check if page is loaded
  async isPageLoaded(): Promise<boolean> {
    return await this.usernameInput.isVisible() && 
           await this.passwordInput.isVisible() && 
           await this.loginButton.isVisible();
  }

  // Method to get password placeholder text
  async getPasswordPlaceholder(): Promise<string | null> {
    return await this.passwordInput.getAttribute('placeholder');
  }

  // Method to perform complete login
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }
}