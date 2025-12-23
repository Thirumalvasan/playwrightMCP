import {test, expect, Page} from '@playwright/test';
import { loginData } from '@testData/loginData';
import { itemTransData } from '@testData/itemtransdata';

async function gotoItemTrans(page: Page) {
    await page.goto(loginData.baseUrl + 'auth/login');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(loginData.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(loginData.password);
    await page.getByRole('button', { name: /Log In/i }).click();
    await page.waitForURL(loginData.baseUrl);
    await expect(page).toHaveURL(loginData.baseUrl);
    await page.getByRole('link', { name: /report/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: /Item Transaction/i }).click();
    await page.waitForURL(loginData.baseUrl + 'report/itemtransactionlist');
    await expect(page).toHaveURL(loginData.baseUrl + 'report/itemtransactionlist');
}

async function handleDateFilterDropdown(page: Page): Promise<void> {
    console.log('Starting date filter dropdown operations...');
    
    const dropdownToggle = await findDateFilterDropdown(page);
    await dropdownToggle.click();
    console.log('Clicked date filter dropdown');

    await page.waitForTimeout(2000);

    const {menuLocator, predefinedOptions} = await getDateFilterOptions(page, dropdownToggle);
    
    console.log(`Found ${predefinedOptions.length} predefined date filter options: ${predefinedOptions.join(', ')}`);
    
    for (let i = 0; i < predefinedOptions.length; i++) {
        const optionText = predefinedOptions[i];
        console.log(`\n[${i + 1}/${predefinedOptions.length}] Selecting date filter: "${optionText}"`);
        
        if (i > 0) {
            await reopenDropdownIfNeeded(page, dropdownToggle, menuLocator);
        }

        await clickDateFilterOption(menuLocator, optionText);

        await page.waitForTimeout(3000);
        console.log('Ready for next filter');
    }
    
    await selectCustomDateRange(page);
}

async function findDateFilterDropdown(page: Page) {
    const toggleCandidates = [
        'label.dropdown-toggle',
        'label:has-text("Date")',
        'label:has-text("Today")',
        '.dropdown-toggle:visible'
    ];

    for (const sel of toggleCandidates) {
        const loc = page.locator(sel).first();
        if (await loc.count() > 0 && await loc.isVisible()) {
            return loc;
        }
    }
    throw new Error('Date dropdown toggle not found');
}

async function getDateFilterOptions(page: Page, dropdownToggle: any): Promise<{menuLocator: any, predefinedOptions: string[]}> {
    let menuLocator = dropdownToggle.locator('xpath=following-sibling::div[contains(@class,"dropdown-menu")]').first();
    if (await menuLocator.count() === 0) {
        menuLocator = page.locator('.dropdown-menu.show').first();
    }
    
    await menuLocator.waitFor({ state: 'visible', timeout: 5000 });
    
    const itemLocators = menuLocator.locator('a.dropdown-item');
    const texts = await itemLocators.allTextContents();
    
    const predefinedOptions = texts
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0 && !t.toLowerCase().includes('custom') && !t.toLowerCase().includes('range'));
    
    return { menuLocator, predefinedOptions };
}
async function reopenDropdownIfNeeded(page: Page, dropdownToggle: any, menuLocator: any) {
    if (!(await menuLocator.isVisible())) {
        await dropdownToggle.click();
        await page.waitForTimeout(1000);
        await menuLocator.waitFor({ state: 'visible', timeout: 5000 });
    }
}

async function clickDateFilterOption(menuLocator: any, optionText: string) {
    const option = menuLocator.locator(`a.dropdown-item:has-text("${optionText}")`).first();
    await option.click({ timeout: 5000 });
    console.log(`Clicked "${optionText}"`);
}

async function selectCustomDateRange(page: Page): Promise<void> {
    console.log('\n\n=== STARTING CUSTOM RANGE SELECTION ===');
    console.log('From itemTransData.ts:');
    console.log('Date Range Start:', itemTransData.dateRangeStart);
    console.log('Date Range End:', itemTransData.dateRangeEnd);
    
    await page.waitForTimeout(2000);
    
    const dropdownToggle = await findDateFilterDropdown(page);
    await dropdownToggle.click();
    await page.waitForTimeout(1000);
    
    const menuLocator = page.locator('.dropdown-menu.show').first();
    const customRangeOption = menuLocator.locator('a.dropdown-item:has-text("Custom Range")').first();
    
    if (await customRangeOption.count() > 0) {
        console.log('Clicking "Custom Range" option...');
        await customRangeOption.click();
        await page.waitForTimeout(1000);
    }
    
    console.log('Looking for Flatpickr input...');
    
    const flatpickrInput = page.locator('input.custom-flatpickr-alt.customized_date_input[placeholder="Custom Range"]').first();
    
    if (await flatpickrInput.count() === 0) {
        const altInput = page.locator('input[placeholder="Custom Range"]').first();
        if (await altInput.count() > 0) {
            console.log('Found Custom Range input, clicking to open calendar...');
            await altInput.click();
        } else {
            throw new Error('Custom Range input not found');
        }
    } else {
        console.log('Found Custom Range input, clicking to open calendar...');
        await flatpickrInput.click();
    }
    
    await page.waitForTimeout(1500);
    
    const calendar = page.locator('.flatpickr-calendar.open').first();
    if (await calendar.count() === 0) {
        console.log('Calendar not open yet, trying to click again...');
        await page.locator('input[placeholder="Custom Range"]').first().click();
        await page.waitForTimeout(1500);
    }
    
    await selectDatesFromFlatpickrCalendar(page);
    
    console.log('Custom date range selected successfully');
}

async function selectDatesFromFlatpickrCalendar(page: Page): Promise<void> {
    console.log('Selecting dates from Flatpickr calendar...');
    
    const startDate = new Date(itemTransData.dateRangeStart);
    const endDate = new Date(itemTransData.dateRangeEnd);
    
    const startAriaLabel = formatDateForAriaLabel(startDate);
    const endAriaLabel = formatDateForAriaLabel(endDate);
    
    console.log(`Selecting start date: ${startAriaLabel}`);
    console.log(`Selecting end date: ${endAriaLabel}`);
    
    await navigateFlatpickrToDate(page, startDate);
    
    const startDay = page.locator(`.flatpickr-day[aria-label="${startAriaLabel}"]`).first();
    if (await startDay.count() > 0) {
        await startDay.click();
        console.log(`Selected start date: ${startAriaLabel}`);
    } else {
        console.log(`Start date not found: ${startAriaLabel}`);
        await navigateFlatpickrByMonth(page, startDate);
        await page.waitForTimeout(1000);
        const retryStart = page.locator(`.flatpickr-day[aria-label="${startAriaLabel}"]`).first();
        if (await retryStart.count() > 0) {
            await retryStart.click();
            console.log(`Selected start date after navigation: ${startAriaLabel}`);
        }
    }
    
    await page.waitForTimeout(1000);
    
    if (startDate.getMonth() !== endDate.getMonth() || startDate.getFullYear() !== endDate.getFullYear()) {
        await navigateFlatpickrToDate(page, endDate);
    }
    
    const endDay = page.locator(`.flatpickr-day[aria-label="${endAriaLabel}"]`).first();
    if (await endDay.count() > 0) {
        await endDay.click();
        console.log(`Selected end date: ${endAriaLabel}`);
    } else {
        console.log(`End date not found: ${endAriaLabel}`);
        await navigateFlatpickrByMonth(page, endDate);
        await page.waitForTimeout(1000);
        const retryEnd = page.locator(`.flatpickr-day[aria-label="${endAriaLabel}"]`).first();
        if (await retryEnd.count() > 0) {
            await retryEnd.click();
            console.log(`Selected end date after navigation: ${endAriaLabel}`);
        }
    }
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await applyDateFilter(page);
}

function formatDateForAriaLabel(date: Date): string {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

async function navigateFlatpickrToDate(page: Page, targetDate: Date): Promise<void> {
    const targetMonth = targetDate.getMonth(); 
    const targetYear = targetDate.getFullYear();
    
    const currentMonthElem = page.locator('.flatpickr-current-month .cur-month').first();
    const currentYearElem = page.locator('.flatpickr-current-month .numInput.cur-year').first();
    
    if (await currentMonthElem.count() === 0 || await currentYearElem.count() === 0) {
        console.log('Could not find current month/year elements');
        return;
    }
    
    const currentMonthText = await currentMonthElem.textContent();
    const currentYearText = await currentYearElem.inputValue();
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const currentMonthIndex = months.findIndex(m => m.startsWith(currentMonthText?.trim() || ''));
    
    if (currentYearText !== targetYear.toString()) {
        console.log(`Navigating to year: ${targetYear}`);
        await currentYearElem.fill(targetYear.toString());
        await currentYearElem.press('Enter');
        await page.waitForTimeout(500);
    }
    
    if (currentMonthIndex !== targetMonth) {
        console.log(`Navigating from ${months[currentMonthIndex]} to ${months[targetMonth]}`);
        const monthDiff = targetMonth - currentMonthIndex;
        const buttonSelector = monthDiff > 0 ? '.flatpickr-next-month' : '.flatpickr-prev-month';
        
        const clicksNeeded = Math.abs(monthDiff);
        for (let i = 0; i < clicksNeeded; i++) {
            await page.locator(buttonSelector).first().click();
            await page.waitForTimeout(300);
        }
        await page.waitForTimeout(500);
    }
}

async function navigateFlatpickrByMonth(page: Page, targetDate: Date): Promise<void> {
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    
    const currentMonthElem = page.locator('.flatpickr-current-month .cur-month').first();
    if (await currentMonthElem.count() === 0) return;
    
    const currentMonthText = await currentMonthElem.textContent();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    let currentMonthIndex = months.findIndex(m => m.startsWith(currentMonthText?.trim() || ''));
    if (currentMonthIndex === -1) currentMonthIndex = 0;
    
    const monthDiff = (targetYear * 12 + targetMonth) - (new Date().getFullYear() * 12 + currentMonthIndex);
    
    if (monthDiff !== 0) {
        const buttonSelector = monthDiff > 0 ? '.flatpickr-next-month' : '.flatpickr-prev-month';
        const clicks = Math.abs(monthDiff);
        
        console.log(`Navigating ${clicks} months ${monthDiff > 0 ? 'forward' : 'backward'}`);
        
        for (let i = 0; i < clicks; i++) {
            await page.locator(buttonSelector).first().click();
            await page.waitForTimeout(300);
        }
        await page.waitForTimeout(500);
    }
}

async function applyDateFilter(page: Page): Promise<void> {
    console.log('Applying date filter...');
    
    const applyButtons = [
        'button:has-text("Apply")',
        'button:has-text("Filter")',
        'button:has-text("Search")',
        'button[type="submit"]',
        '.btn-primary'
    ];
    
    for (const selector of applyButtons) {
        const button = page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible()) {
            await button.click();
            console.log(`Clicked ${selector} button`);
            await page.waitForTimeout(3000);
            return;
        }
    }
    
    console.log('No apply button found, pressing Enter...');
    await page.locator('input[placeholder="Custom Range"]').first().press('Enter');
    await page.waitForTimeout(3000);
}

test('verify Item Transactions Report page loads correctly', async({page}) => {
    test.setTimeout(180000); 
    
    await gotoItemTrans(page);
    
    await expect(page.getByRole('heading', { name: /Item Transaction/i })).toBeVisible();
    await handleDateFilterDropdown(page);
    
    await page.screenshot({ 
        path: 'test-results/final-custom-range.png',
        fullPage: true 
    });
    
    console.log('Test completed successfully!');
});
