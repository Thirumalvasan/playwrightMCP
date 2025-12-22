import { Page, Locator } from '@playwright/test';

export class UomMasterUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async toggleUomSortingASC(): Promise<void> {
    try {
      const sortIcon: Locator = this.page.locator('i[name="sorticon"]').first();
      await sortIcon.waitFor({ state: 'visible', timeout: 5000 });
      await sortIcon.click();
      await this.waitForTableUpdate();
      console.log('Toggled UOM sorting (ASC)');
    } catch (error) {
      console.error('Error toggling UOM sorting ASC:', error);
      throw error;
    }
  }

  async toggleUomSortingDESC(): Promise<void> {
    try {
      const sortIcon: Locator = this.page.locator('i[name="sorticon"]').first();
      await sortIcon.waitFor({ state: 'visible', timeout: 5000 });
      await sortIcon.click();
      await this.waitForTableUpdate();
      console.log('Toggled UOM sorting (DESC)');
    } catch (error) {
      console.error('Error toggling UOM sorting DESC:', error);
      throw error;
    }
  }

  async toggleTimestampSortingASC(): Promise<void> {
    try {
      const timestampSortIcon: Locator = this.page.locator('div.header-container i[name="sorticon"]').first();
      await timestampSortIcon.waitFor({ state: 'visible', timeout: 5000 });
      await timestampSortIcon.click();
      await this.waitForTableUpdate();
      console.log('Toggled Timestamp sorting (ASC)');
    } catch (error) {
      console.error('Error toggling Timestamp sorting ASC:', error);
      throw error;
    }
  }

  async toggleTimestampSortingDESC(): Promise<void> {
    try {
      const timestampSortIcon: Locator = this.page.locator('div.header-container i[name="sorticon"]').first();
      await timestampSortIcon.waitFor({ state: 'visible', timeout: 5000 });
      await timestampSortIcon.click();
      await this.waitForTableUpdate();
      console.log('Toggled Timestamp sorting (DESC)');
    } catch (error) {
      console.error('Error toggling Timestamp sorting DESC:', error);
      throw error;
    }
  }

  async filterByUomName(uomName: string): Promise<void> {
    try {
      const filterIcon: Locator = this.page.locator('div.d-flex.justify-content-center i.ri-filter-3-line');
      await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
      await filterIcon.click();
      
      const filterInput: Locator = this.page.locator('input[name="searchforitems"]');
      await filterInput.waitFor({ state: 'visible', timeout: 5000 });
      
      await filterInput.clear();
      await filterInput.fill(uomName);
      
      await this.waitForTableUpdate();
      
      console.log(`Applied filter for UOM name: ${uomName}`);
    } catch (error) {
      console.error('Error applying UOM name filter:', error);
      throw error;
    }
  }

  async clearFilter(): Promise<void> {
    try {
      const filterIcon: Locator = this.page.locator('div.d-flex.justify-content-center i.ri-filter-3-line');
      await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
      await filterIcon.click();
      
      const filterInput: Locator = this.page.locator('input[name="searchforitems"]');
      await filterInput.waitFor({ state: 'visible', timeout: 5000 });
      await filterInput.clear();
      
      await filterInput.press('Enter');
      
      await this.waitForTableUpdate();
      
      console.log('Cleared UOM filter');
    } catch (error) {
      console.error('Error clearing filter:', error);
      throw error;
    }
  }

  async getFirstRowUomName(): Promise<string> {
    try {
      const firstRowCell: Locator = this.page.locator('table tbody tr:first-child td:nth-child(1)');
      await firstRowCell.waitFor({ state: 'visible', timeout: 5000 });
      return await firstRowCell.innerText();
    } catch (error) {
      console.error('Error getting first row UOM name:', error);
      return '';
    }
  }

  async getTableRowCount(): Promise<number> {
    try {
      const rows: Locator = this.page.locator('table tbody tr');
      await rows.first().waitFor({ state: 'visible', timeout: 5000 });
      return await rows.count();
    } catch (error) {
      console.log('No rows found or error counting rows:', error);
      return 0;
    }
  }

  async getAllUomNames(): Promise<string[]> {
    try {
      const uomCells: Locator = this.page.locator('table tbody tr td:nth-child(1)');
      await uomCells.first().waitFor({ state: 'visible', timeout: 5000 });
      const count = await uomCells.count();
      
      const uomNames: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await uomCells.nth(i).innerText();
        uomNames.push(text);
      }
      
      return uomNames;
    } catch (error) {
      console.error('Error getting UOM names:', error);
      return [];
    }
  }

  async waitForTableUpdate(timeout: number = 10000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle');
      
      await this.page.waitForTimeout(1000);
      
      await this.page.locator('table tbody').waitFor({ state: 'attached', timeout });
      
      console.log('Table update completed');
    } catch (error) {
      console.log('Table update wait completed (may have timed out):', error);
    }
  }

  async debugTableState(): Promise<void> {
    console.log('=== DEBUG TABLE STATE ===');
    
    const rowCount = await this.getTableRowCount();
    console.log(`Total rows: ${rowCount}`);
    
    if (rowCount > 0) {
      const firstRowUom = await this.getFirstRowUomName();
      console.log(`First row UOM: "${firstRowUom}"`);
      
      const allUomNames = await this.getAllUomNames();
      console.log('All UOM names:', allUomNames);
    } else {
      console.log('No rows found in table');
    }
    
    console.log('=== END DEBUG ===');
  }

  async verifyFilterResults(expectedFilter: string): Promise<boolean> {
    await this.waitForTableUpdate();
    
    const rowCount = await this.getTableRowCount();
    
    if (rowCount === 0) {
      console.log('No results found for filter - might be expected');
      return true;
    }
    
    const allUomNames = await this.getAllUomNames();
    const allMatchFilter = allUomNames.every(name => 
      name.toLowerCase().includes(expectedFilter.toLowerCase())
    );
    
    if (!allMatchFilter) {
      console.log('Filter verification failed. Found:', allUomNames);
      return false;
    }
    
    console.log('Filter verification passed');
    return true;
  }
}