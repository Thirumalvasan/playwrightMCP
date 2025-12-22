import { test } from '@playwright/test';

// This runs after every test in your project
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'passed') {
    console.log(`✅ Passed: ${testInfo.title}`);
  }
});