"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'passed') {
        console.log(`✅ Passed: ${testInfo.title}`);
    }
});
//# sourceMappingURL=setup.js.map