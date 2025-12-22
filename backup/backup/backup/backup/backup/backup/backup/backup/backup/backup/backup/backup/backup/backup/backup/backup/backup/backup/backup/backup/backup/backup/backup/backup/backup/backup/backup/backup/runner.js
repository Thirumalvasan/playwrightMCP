// runner.js - Simple executable entry point
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=========================================');
console.log('   🎬 PLAYWRIGHT TEST RUNNER v1.0.0     ');
console.log('=========================================');

// Show help if no arguments or --help
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  showHelp();
  if (args.length === 0) {
    process.exit(0);
  }
}

// Run the tests
runTests(args);

function showHelp() {
  console.log('\n📖 USAGE:');
  console.log('  PlaywrightRunner.exe [test-path] [options]');
  console.log('\n📂 TEST PATHS:');
  console.log('  tests/login/login.spec.ts');
  console.log('  tests/master/Item-Group/add-item-group.spec.ts');
  console.log('  (empty) - Run all tests');
  
  console.log('\n⚙️  OPTIONS:');
  console.log('  --headed      Run with visible browser');
  console.log('  --debug       Run in debug mode');
  console.log('  --ui          Run with Playwright UI');
  console.log('  --help, -h    Show this help');
  
  console.log('\n📋 EXAMPLES:');
  console.log('  PlaywrightRunner.exe tests/login/login.spec.ts');
  console.log('  PlaywrightRunner.exe tests/master/Item-Group/add-item-group.spec.ts --headed');
  console.log('  PlaywrightRunner.exe --debug');
  console.log('  PlaywrightRunner.exe --ui');
  console.log('');
}

function runTests(args) {
  try {
    console.log('\n🚀 Starting Playwright tests...\n');
    
    // Build command
    let command = 'npx playwright test';
    
    // Add test path if provided
    const testPath = args.find(arg => !arg.startsWith('--'));
    if (testPath) {
      command += ` "${testPath}"`;
    }
    
    // Add options
    const options = args.filter(arg => arg.startsWith('--'));
    if (options.length > 0) {
      command += ' ' + options.join(' ');
    }
    
    console.log(`Command: ${command}\n`);
    console.log('=========================================\n');
    
    // Execute command
    execSync(command, {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log('\n✅ Tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Tests failed!');
    process.exit(1);
  }
}