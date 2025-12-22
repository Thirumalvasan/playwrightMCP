"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemTransactionsReportUtils = void 0;
class ItemTransactionsReportUtils {
    page;
    constructor(page) {
        this.page = page;
    }
    async getDateFilterOptions() {
        const dropdownToggle = this.page.locator('label.dropdown-toggle.form-select2, label.dropdown-toggle').first();
        await dropdownToggle.click();
        await this.page.waitForSelector('.dropdown-menu a.dropdown-item', { state: 'visible', timeout: 5000 });
        const itemLocators = this.page.locator('.dropdown-menu a.dropdown-item');
        const texts = await itemLocators.allTextContents();
        return texts.map(t => t.trim()).filter(t => t.length > 0);
    }
    async selectDateFilter(optionText) {
        if (!(await this.page.locator('.dropdown-menu').first().isVisible())) {
            const dropdownToggle = this.page.locator('label.dropdown-toggle.form-select2, label.dropdown-toggle').first();
            await dropdownToggle.click();
            await this.page.waitForSelector('.dropdown-menu a.dropdown-item', { state: 'visible', timeout: 5000 });
        }
        const option = this.page.locator('.dropdown-menu a.dropdown-item', { hasText: optionText }).first();
        try {
            await option.click({ timeout: 5000 });
        }
        catch (err) {
            await this.page.evaluate((text) => {
                const items = Array.from(document.querySelectorAll('.dropdown-menu a.dropdown-item'));
                const target = items.find(i => i.innerText && i.innerText.trim() === text);
                if (target)
                    target.click();
            }, optionText);
        }
    }
}
exports.ItemTransactionsReportUtils = ItemTransactionsReportUtils;
//# sourceMappingURL=ItemTransactionsReportUtils.js.map