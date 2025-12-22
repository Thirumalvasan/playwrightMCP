const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🔒 Building Secure Test Package');
console.log('================================\n');

// Configuration
const PACKAGE_NAME = 'SecurePlaywrightTests';
const VERSION = '1.0.0';

async function buildSecurePackage() {
  try {
    // Step 1: Clean previous builds
    console.log('1. Cleaning previous builds...');
    fs.removeSync('compiled');
    fs.removeSync('compiled-obfuscated');
    fs.removeSync(PACKAGE_NAME);
    fs.removeSync(`${PACKAGE_NAME}.zip`);
    
    // Step 2: Compile TypeScript to JavaScript
    console.log('\n2. Compiling TypeScript tests...');
    try {
      execSync(`npx tsc -p tsconfig.compile.json`, { stdio: 'inherit' });
      console.log('✅ Tests compiled successfully');
    } catch (error) {
      console.error('❌ TypeScript compilation failed');
      process.exit(1);
    }
    
    // Step 3: Obfuscate JavaScript code
    console.log('\n3. Obfuscating JavaScript code...');
    const obfuscatorConfig = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    };
    
    fs.writeFileSync('obfuscator-config.json', JSON.stringify(obfuscatorConfig, null, 2));
    
    execSync(
      `npx javascript-obfuscator compiled --output compiled-obfuscated --config obfuscator-config.json`,
      { stdio: 'inherit' }
    );
    
    // Step 4: Create package structure
    console.log('\n4. Creating package structure...');
    fs.ensureDirSync(PACKAGE_NAME);
    
    // Copy EXE
    if (fs.existsSync('executables/playwright-runner.exe')) {
      fs.copySync('executables/playwright-runner.exe', `${PACKAGE_NAME}/playwright-runner.exe`);
      console.log('✅ EXE copied');
    } else {
      console.error('❌ EXE not found. Build it first with: npm run build:exe:win');
      process.exit(1);
    }
    
    // Copy compiled and obfuscated tests
    if (fs.existsSync('compiled-obfuscated/tests')) {
      fs.copySync('compiled-obfuscated/tests', `${PACKAGE_NAME}/tests`);
      console.log('✅ Obfuscated tests copied');
    }
    
    // Copy compiled pages and utils if they exist
    if (fs.existsSync('compiled-obfuscated/pages')) {
      fs.copySync('compiled-obfuscated/pages', `${PACKAGE_NAME}/pages`);
      console.log('✅ Obfuscated pages copied');
    }
    
    if (fs.existsSync('compiled-obfuscated/utils')) {
      fs.copySync('compiled-obfuscated/utils', `${PACKAGE_NAME}/utils`);
      console.log('✅ Obfuscated utils copied');
    }
    
    // Step 5: Create batch files
    console.log('\n5. Creating user interface files...');
    
    // INSTALL batch
    const installBat = `@echo off
chcp 65001 > nul
echo ========================================
echo    SECURE PLAYWRIGHT TEST RUNNER
echo ========================================
echo.
echo STEP 1: Browser Installation
echo.
echo This will install required browsers:
echo - Google Chrome
echo - Microsoft Edge  
echo - Mozilla Firefox
echo.
echo Please wait 3-5 minutes...
echo DO NOT close this window!
echo ========================================
echo.
playwright-runner.exe install --with-deps
echo.
echo ========================================
echo    INSTALLATION COMPLETE!
echo ========================================
echo.
echo Next: Run 2_RUN_TEST.bat
echo.
pause`;
    
    fs.writeFileSync(`${PACKAGE_NAME}/1_INSTALL.bat`, installBat);
    
    // RUN TEST batch
    const runTestBat = `@echo off
chcp 65001 > nul
echo ========================================
echo    RUNNING SECURE AUTOMATED TESTS
echo ========================================
echo.
echo STEP 2: Test Execution
echo.
echo Requirements:
echo 1. Your application must be RUNNING
echo 2. Internet connection required
echo 3. Do NOT close browser windows
echo.
echo ========================================
echo.
echo Tests are compiled and secured.
echo Source code is not accessible.
echo.
echo Starting tests in 3 seconds...
timeout /t 3 /nobreak > nul
echo.
playwright-runner.exe run tests/ --headed
echo.
echo ========================================
echo    TEST EXECUTION COMPLETE
echo ========================================
echo.
pause`;
    
    fs.writeFileSync(`${PACKAGE_NAME}/2_RUN_TEST.bat`, runTestBat);
    
    // Step 6: Create README
    console.log('\n6. Creating documentation...');
    
    const readme = `SECURE PLAYWRIGHT TEST RUNNER v${VERSION}
================================================================

DESCRIPTION:
This package contains compiled and secured automated tests.
The test logic is obfuscated and cannot be viewed or modified.

SYSTEM REQUIREMENTS:
- Windows 10/11 (64-bit)
- 4GB RAM minimum
- Internet connection (first run)
- Your web application must be running

INSTALLATION INSTRUCTIONS:
1. Extract this ZIP to any folder
2. Run "1_INSTALL.bat" (wait 3-5 minutes)
3. Ensure your web application is running
4. Run "2_RUN_TEST.bat" to execute tests

FILES INCLUDED:
- playwright-runner.exe      (Main executable)
- 1_INSTALL.bat              (Browser installation)
- 2_RUN_TEST.bat             (Test execution)
- tests/                     (Compiled test files - NOT editable)
- pages/                     (Compiled page objects - NOT editable)
- utils/                     (Compiled utilities - NOT editable)

SECURITY NOTES:
- Test code is compiled to JavaScript
- JavaScript is obfuscated for protection
- Source TypeScript files are NOT included
- Modifications require original source code

TROUBLESHOOTING:
1. If blocked by antivirus: Add exception for this folder
2. If browsers don't open: Run as Administrator
3. If tests fail: Ensure your application is running
4. Contact support for test updates

SUPPORT:
For test modifications or issues, contact the test automation team.
Do not attempt to modify compiled test files.

================================================================
Generated: ${new Date().toISOString().split('T')[0]}
================================================================`;

    fs.writeFileSync(`${PACKAGE_NAME}/README.txt`, readme, 'utf8');
    
    // Step 7: Create ZIP
    console.log('\n7. Creating distribution package...');
    
    const zipCommand = `powershell Compress-Archive -Path "${PACKAGE_NAME}\\*" -DestinationPath "${PACKAGE_NAME}.zip" -Force`;
    execSync(zipCommand, { stdio: 'inherit' });
    
    // Step 8: Cleanup
    console.log('\n8. Cleaning temporary files...');
    fs.removeSync('compiled');
    fs.removeSync('compiled-obfuscated');
    fs.removeSync('obfuscator-config.json');
    
    // Step 9: Show success message
    console.log('\n' + '='.repeat(50));
    console.log('✅ SECURE PACKAGE CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`\n📦 Package: ${PACKAGE_NAME}.zip`);
    console.log(`📁 Size: ${(fs.statSync(`${PACKAGE_NAME}.zip`).size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🔒 Security: Tests are compiled and obfuscated`);
    console.log(`🚀 Ready to share with team members`);
    
    console.log('\n📋 FILES YOUR TEAM WILL SEE:');
    const files = fs.readdirSync(PACKAGE_NAME);
    files.forEach(file => {
      const stats = fs.statSync(path.join(PACKAGE_NAME, file));
      if (stats.isDirectory()) {
        console.log(`   📁 ${file}/ (compiled - not editable)`);
      } else {
        console.log(`   📄 ${file}`);
      }
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Share the ZIP file with your team');
    console.log('2. Tell them to extract and run 1_INSTALL.bat first');
    console.log('3. Then run 2_RUN_TEST.bat');
    console.log('4. Tests will run automatically');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildSecurePackage();