import { defineConfig, devices } from '@playwright/test';
import { MilkyMistConfig } from './configs/MilkyMist.config';
import { PernordConfig } from './configs/Pernord.config';
import { KKPConfig } from './configs/KKP.config';

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'milkymist-chrome',
      testDir: './tests/MilkyMist',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: MilkyMistConfig.baseURL,
      },
    },

      // == Currently Firefox Browser Disbabled == Thirumalvasan

    // {
    //   name: 'milkymist-firefox',
    //   testDir: './tests/MilkyMist',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     baseURL: MilkyMistConfig.baseURL,
    //   },
    // },

    {
      name: 'pernord-chrome',
      testDir: './tests/Pernord',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: PernordConfig.baseURL,
      },
    },

    // == Currently Firefox Browser Disbabled == Thirumalvasan

    // {
    //   name: 'pernord-firefox',
    //   testDir: './tests/Pernord',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     baseURL: PernordConfig.baseURL,
    //   },
    // },
    {
      name: 'kkp-chrome',
      testDir: './tests/KKP',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: KKPConfig.baseURL,
      },
    },

    // == Currently Firefox Browser Disbabled == Thirumalvasan

    // {
    //   name: 'kkp-firefox',
    //   testDir: './tests/KKP',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     baseURL: KKPConfig.baseURL,
    //   },
    // },
  ],
});