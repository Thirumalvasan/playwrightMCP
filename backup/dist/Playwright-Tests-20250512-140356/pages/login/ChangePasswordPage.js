"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordPage = void 0;
class ChangePasswordPage {
    page;
    oldPasswordInput;
    newPasswordInput;
    confirmPasswordInput;
    submitButton;
    cancelButton;
    closeButton;
    popupContainer;
    errorMessageContainer;
    successMessageContainer;
    successSweetAlertPopup;
    successSweetAlertMessage;
    successSweetAlertOKButton;
    constructor(page) {
        this.page = page;
        this.oldPasswordInput = page.locator('#currentpassword, ' +
            '[formcontrolname="currentpassword"], ' +
            'input[placeholder*="current" i], ' +
            'input[placeholder*="Current" i]');
        this.newPasswordInput = page.locator('input[name="newpassword"], input[placeholder*="Enter new password"]');
        this.confirmPasswordInput = page.locator('[formcontrolname="confirmpassword"]');
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.cancelButton = page.locator('button:has-text("Cancel"), button[class*="cancel"]');
        this.closeButton = page.locator('button[aria-label="Close"], .close-button, i.ri-close-line');
        this.popupContainer = page.locator('.modal, .popup, [class*="password-change"], [class*="change-password"]');
        this.errorMessageContainer = page.locator('span.text-danger, ' +
            'div.is-invalid span, ' +
            '.text-danger.required-font, ' +
            '[role="alert"], ' +
            '.error-message');
        this.successMessageContainer = page.locator('[class*="success"], .success-message, .alert-success');
        this.successSweetAlertPopup = page.locator('.swal2-popup.swal2-modal.swal2-icon-success');
        this.successSweetAlertMessage = page.locator('#swal2-html-container');
        this.successSweetAlertOKButton = page.locator('button.swal2-confirm');
    }
    async isPasswordChangePopupVisible(timeout = 5000) {
        try {
            await this.popupContainer.waitFor({ state: 'visible', timeout });
            return true;
        }
        catch {
            return false;
        }
    }
    async getFirstErrorMessage() {
        const firstError = this.errorMessageContainer.first();
        try {
            await firstError.waitFor({ state: 'visible', timeout: 5000 });
            return (await firstError.textContent())?.trim() || '';
        }
        catch {
            try {
                const text = await firstError.textContent();
                if (text?.trim()) {
                    return text.trim();
                }
            }
            catch {
            }
            return '';
        }
    }
    async getAllErrorMessages() {
        try {
            const errorElements = await this.errorMessageContainer.all();
            const messages = [];
            for (const element of errorElements) {
                try {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        messages.push(text.trim());
                    }
                }
                catch {
                }
            }
            return messages.join(' | ');
        }
        catch {
            return '';
        }
    }
    async getErrorMessagesArray() {
        try {
            await this.errorMessageContainer.first().waitFor({ state: 'visible', timeout: 3000 });
        }
        catch {
        }
        const errorElements = await this.errorMessageContainer.all();
        const messages = [];
        for (const element of errorElements) {
            try {
                const text = await element.textContent();
                if (text && text.trim()) {
                    messages.push(text.trim());
                }
            }
            catch {
            }
        }
        return messages;
    }
    async isAnyErrorVisible() {
        try {
            const count = await this.errorMessageContainer.count();
            if (count === 0)
                return false;
            return await this.errorMessageContainer.first().isVisible();
        }
        catch {
            return false;
        }
    }
    async getErrorMessageText() {
        try {
            const allMessages = await this.getAllErrorMessages();
            if (allMessages)
                return allMessages;
            const firstMessage = await this.getFirstErrorMessage();
            return firstMessage;
        }
        catch (error) {
            console.warn('Could not retrieve error messages:', error);
            return '';
        }
    }
    async isPasswordChangeSuccess() {
        try {
            await this.page.waitForURL('**/dashboard', { timeout: 10000 });
            return true;
        }
        catch {
            if (await this.successMessageContainer.isVisible({ timeout: 5000 })) {
                return true;
            }
            return false;
        }
    }
    async canClosePopup() {
        return await this.closeButton.isVisible();
    }
    async openChangePasswordPopup() {
        const changePasswordLink = this.page.locator('a:has-text("Change Password"), button:has-text("Change Password")');
        if (await changePasswordLink.isVisible()) {
            await changePasswordLink.click();
            await this.page.waitForTimeout(1000);
        }
    }
    async fillPasswordChangeForm(oldPassword, newPassword, confirmPassword) {
        await this.oldPasswordInput.fill(oldPassword);
        await this.newPasswordInput.fill(newPassword);
        await this.confirmPasswordInput.fill(confirmPassword);
    }
    async enterOldPassword(password) {
        await this.oldPasswordInput.fill(password);
    }
    async enterNewPassword(password) {
        await this.newPasswordInput.fill(password);
    }
    async enterConfirmPassword(password) {
        await this.confirmPasswordInput.fill(password);
    }
    async clickSubmit() {
        await this.submitButton.click();
        await this.page.waitForTimeout(2000);
    }
    async clickCancel() {
        if (await this.cancelButton.isVisible()) {
            await this.cancelButton.click();
        }
    }
    async closePopup() {
        if (await this.closeButton.isVisible()) {
            await this.closeButton.click();
            await this.page.waitForTimeout(1000);
        }
    }
    async isSuccessPopupVisible(timeout = 5000) {
        try {
            await this.successSweetAlertPopup.waitFor({ state: 'visible', timeout });
            return true;
        }
        catch {
            return false;
        }
    }
    async getSuccessPopupMessage() {
        try {
            if (await this.successSweetAlertPopup.isVisible()) {
                const message = await this.successSweetAlertMessage.textContent();
                return message?.trim() || '';
            }
            return '';
        }
        catch {
            return '';
        }
    }
    async clickSuccessPopupOK() {
        try {
            if (await this.successSweetAlertOKButton.isVisible()) {
                await this.successSweetAlertOKButton.click();
                await this.page.waitForTimeout(1000);
            }
        }
        catch (error) {
            console.warn('Could not click success popup OK button:', error);
        }
    }
    async handlePasswordChangeSuccess() {
        try {
            const isSuccess = await this.isSuccessPopupVisible(5000);
            if (isSuccess) {
                const message = await this.getSuccessPopupMessage();
                console.log(`✓ Success Popup Message: "${message}"`);
                await this.clickSuccessPopupOK();
                console.log('✓ Clicked OK on success popup');
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn('Error handling password change success:', error);
            return false;
        }
    }
    getOldPasswordInput() {
        return this.oldPasswordInput;
    }
    getNewPasswordInput() {
        return this.newPasswordInput;
    }
    getConfirmPasswordInput() {
        return this.confirmPasswordInput;
    }
    getSubmitButton() {
        return this.submitButton;
    }
    getPopupContainer() {
        return this.popupContainer;
    }
}
exports.ChangePasswordPage = ChangePasswordPage;
//# sourceMappingURL=ChangePasswordPage.js.map