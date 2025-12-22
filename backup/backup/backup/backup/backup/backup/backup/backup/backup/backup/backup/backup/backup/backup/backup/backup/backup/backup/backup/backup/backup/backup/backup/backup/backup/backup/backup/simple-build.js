const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Simple EXE Builder\n');

// Step 1: Clean
console.log('1. Cleaning...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
if (fs.existsSync('executables')) {
  fs.rmSync('executables', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('executables', { recursive: true });

// Step 2: Create a simple CLI if src/cli.ts doesn't exist
if (!fs.existsSync('src/cli.ts')) {
  console.log('2. Creating src/cli.ts...');
  fs.mkdirSync('src', { recursive: true });
  
  const cliCode = `#!/usr/bin/env node
import { program } from 'commander';
import { execSync } from 'child_process';

program
  .name('playwright-runner')
  .description('Run Playwright tests')
  .version('1.0.0');

program
  .command('run')
  .description('Run tests')
  .argument('[test-path]', 'Test file')
  .option('-h, --headed', 'Run in headed mode')
  .action((testPath, options) => {
    console.log('🚀 Playwright Runner');
    const args = ['npx', 'playwright', 'test'];
    if (testPath) args.push(testPath);
    if (options.headed) args.push('--headed');
    console.log('Running:', args.join(' '));
    execSync(args.join(' '), { stdio: 'inherit' });
  });

program.parse();`;
  
  fs.writeFileSync('src/cli.ts', cliCode);
}

// Step 3: Compile with specific options
console.log('3. Compiling TypeScript...');
try {
  // Simple direct compilation
  execSync('npx tsc src/cli.ts --outDir dist --module commonjs --target es2022', { 
    stdio: 'inherit' 
  });
} catch (e) {
  console.log('Compilation failed, trying alternative...');
  // Try with ts-node
  execSync('npx ts-node --transpile-only src/cli.ts --help', { stdio: 'pipe' });
}

// Step 4: Check if cli.js was created
if (fs.existsSync('dist/cli.js')) {
  console.log('✅ dist/cli.js created successfully');
  
  // Step 5: Build EXE
  console.log('4. Building EXE...');
  try {
    execSync('npx pkg dist/cli.js --targets node18-win-x64 --output executables/playwright-runner.exe', {
      stdio: 'inherit'
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ EXE BUILT SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📦 Executable: executables/playwright-runner.exe');
    console.log(`📏 Size: ${(fs.statSync('executables/playwright-runner.exe').size / 1024 / 1024).toFixed(2)} MB`);
    
    // Test it
    console.log('\n🧪 Quick test:');
    console.log('  cd executables');
    console.log('  playwright-runner.exe --help');
    
  } catch (e) {
    console.error('❌ pkg failed:', e.message);
  }
} else {
  console.error('❌ dist/cli.js not created!');
  console.log('\nChecking dist folder:');
  const files = fs.readdirSync('dist');
  if (files.length === 0) {
    console.log('  (empty)');
  } else {
    files.forEach(f => console.log('  ' + f));
  }
}