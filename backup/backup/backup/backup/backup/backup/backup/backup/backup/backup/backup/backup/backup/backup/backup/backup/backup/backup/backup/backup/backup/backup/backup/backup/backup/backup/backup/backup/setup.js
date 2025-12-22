"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
// This runs after every test in your project
test_1.test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'passed') {
        console.log(`✅ Passed: ${testInfo.title}`);
    }
});
