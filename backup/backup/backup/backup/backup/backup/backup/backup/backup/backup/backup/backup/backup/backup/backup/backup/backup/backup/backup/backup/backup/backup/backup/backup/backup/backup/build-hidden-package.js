const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('Building package with hidden source code...\n');

// 1. Clean
fs.removeSync('hidden-package');
fs.removeSync('compiled');
fs.ensureDirSync('hidden-package');

// 2. Compile tests to JavaScript (no source maps)
console.log('1. Compiling tests to JavaScript...');
execSync('npx tsc -p tsconfig.compile.json', { stdio: 'inherit' });

// 3. Obfuscate JavaScript (optional)
console.log('\n2. Obfuscating code...');
execSync('npx javascript-obfuscator compiled --output compiled-obfuscated', { stdio: 'inherit' });

// 4. Copy only compiled/obfuscated files
console.log('\n3. Creating package...');

// Copy EXE
fs.copySync('executables/playwright-runner.exe', 'hidden-package/playwright-runner.exe');

// Copy compiled tests
fs.copySync('compiled-obfuscated/tests', 'hidden-package/tests');

// Create batch files
const installBat = `@echo off
echo Installing Playwright browsers...
playwright-runner.exe install --with-deps
echo Done! Now run RUN_TEST.bat
pause`;

const runTestBat = `@echo off
echo Running automated test...
echo Test code is compiled - cannot be modified
playwright-runner.exe run tests/master/Item-Group/add-item-group.spec.js --headed
pause`;

fs.writeFileSync('hidden-package/1_INSTALL.bat', installBat);
fs.writeFileSync('hidden-package/2_RUN_TEST.bat', runTestBat);

// Create README
const readme = `SECURE TEST RUNNER
=================

This package contains compiled tests only.
Source code is not included for security.

USAGE:
1. Run 1_INSTALL.bat (once)
2. Run 2_RUN_TEST.bat (to execute tests)
3. Ensure your application is running

NOTE: Test files (.js) are compiled and cannot be modified.
Contact administrator for test updates.`;

fs.writeFileSync('hidden-package/README.txt', readme);

// 5. Create ZIP
console.log('\n4. Creating ZIP...');
execSync('powershell Compress-Archive -Path hidden-package/* -DestinationPath SecureTests.zip', {
  stdio: 'inherit'
});

console.log('\n✅ Package created: SecureTests.zip');
console.log('📦 Test code is compiled and hidden');
console.log('🚀 Share with team members');