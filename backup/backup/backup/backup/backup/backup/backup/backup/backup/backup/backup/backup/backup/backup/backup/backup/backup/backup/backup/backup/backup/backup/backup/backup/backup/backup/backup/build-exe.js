const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🔨 Building Playwright Runner EXE...');
console.log('====================================\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
fs.removeSync('dist');
fs.removeSync('executables');
fs.ensureDirSync('executables');

// Step 2: Compile TypeScript
console.log('2. Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compiled successfully\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// Step 3: Copy necessary files to dist
console.log('3. Copying required files...');
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'playwright.config.ts',
  '.env.example',
  'tests',
  'pages',
  'utils'
];

filesToCopy.forEach(item => {
  if (fs.existsSync(item)) {
    const dest = path.join('dist', item);
    fs.copySync(item, dest, { overwrite: true });
    console.log(`   📁 Copied: ${item} -> ${dest}`);
  }
});

// Step 4: Create package.json for pkg
console.log('\n4. Creating pkg configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const pkgConfig = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: "cli.js",
  bin: {
    "playwright-runner": "cli.js"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(pkgConfig, null, 2));

// Add this after step 4 in your build-exe.js
console.log('4. Creating entry point cli.js...');

// Create dist/cli.js as pkg entry point
const cliContent = `#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');

// Ensure browsers are installed
try {
  require('playwright')._setupChromium();
} catch(e) {
  console.log('Installing browsers...');
  execSync('npx playwright install --with-deps chromium', {stdio: 'inherit'});
}

const args = process.argv.slice(2).join(' ') || 'tests/**/*.spec.ts';
console.log('Running Playwright tests:', args);

execSync(\`npx playwright test \${args}\`, { 
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: path.join(__dirname, '.playwright-browsers')
  }
});
`;

require('fs').writeFileSync('dist/cli.js', cliContent);
console.log('   ✅ Created: dist/cli.js');


// Step 5: Build EXE with pkg
console.log('\n5. Building EXE with pkg...');
console.log('   This may take a few minutes...\n');

const targets = process.argv[2] || 'node18-win-x64';
const outputName = `playwright-runner-${packageJson.version}`;

try {
  execSync(`npx pkg dist/cli.js --targets ${targets} --output executables/${outputName}`, {
    stdio: 'inherit'
  });
  
  // Step 6: Create README for executable
  const readme = `# Playwright Test Runner ${packageJson.version}

## Usage:
1. Copy this executable to a folder with your test files
2. Place your test files in a 'tests' folder
3. Run the executable with commands:

### Commands:
  ${outputName}.exe run [test-file]    Run a specific test
  ${outputName}.exe ui                 Open Playwright UI
  ${outputName}.exe headed             Run tests in headed mode
  ${outputName}.exe install            Install browsers
  ${outputName}.exe list               List available tests

### Examples:
  ${outputName}.exe run tests/login.spec.js
  ${outputName}.exe run tests/checkout.spec.js --headed
  ${outputName}.exe install --with-deps

## Required folder structure:
📁 YourProject/
├── ${outputName}.exe    (this file)
├── tests/              (your test files)
├── pages/              (page objects)
├── utils/              (utilities)
└── playwright.config.ts (configuration)

## Note:
- First run will install required browsers
- Test files can be .js or .ts format
- Use --headed flag to see browser windows
`;

  fs.writeFileSync(`executables/README.txt`, readme);
  
  console.log('\n✅ Build completed successfully!');
  console.log('================================');
  console.log(`📦 Executable: executables/${outputName}.exe`);
  console.log(`📄 Readme: executables/README.txt`);
  console.log('\n🚀 To use:');
  console.log(`  1. Copy ${outputName}.exe to your project folder`);
  console.log('  2. Ensure your test files are in a "tests" folder');
  console.log(`  3. Run: ${outputName}.exe run tests/login.spec.js --headed`);
  
} catch (error) {
  console.error('❌ pkg build failed');
  process.exit(1);
}