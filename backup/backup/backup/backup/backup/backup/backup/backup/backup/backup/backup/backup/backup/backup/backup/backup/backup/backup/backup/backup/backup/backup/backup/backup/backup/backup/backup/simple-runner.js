// simple-runner.js - Simpler version
const { execSync } = require('child_process');

console.log('Playwright Runner - Simple Version\n');

const args = process.argv.slice(2);
const testPath = args.find(arg => !arg.startsWith('--')) || '';
const options = args.filter(arg => arg.startsWith('--'));

try {
  let command = 'npx playwright test';
  if (testPath) command += ` "${testPath}"`;
  if (options.length) command += ' ' + options.join(' ');
  
  console.log(`Running: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}