#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
commander_1.program
    .name('playwright-runner')
    .description('CLI tool to run Playwright tests')
    .version('1.0.0');
commander_1.program
    .command('run')
    .description('Run Playwright tests')
    .argument('[test-path]', 'Test file or directory')
    .option('-h, --headed', 'Run in headed mode')
    .option('-d, --debug', 'Run in debug mode')
    .option('-u, --ui', 'Run in UI mode')
    .option('-r, --report', 'Generate HTML report')
    .action((testPath, options) => {
    console.log('🚀 Playwright Test Runner\n');
    const testDir = path_1.default.join(process.cwd(), 'tests');
    if (!fs_1.default.existsSync(testDir)) {
        console.error(`❌ Error: No 'tests' folder found in:\n${process.cwd()}`);
        console.log('\n💡 Solution:');
        console.log('1. Copy this executable to your project folder');
        console.log('2. Ensure you have a "tests" folder with your test files');
        console.log('3. Run again from that folder\n');
        process.exit(1);
    }
    const args = ['npx', 'playwright', 'test'];
    if (testPath) {
        args.push(`tests/${testPath}`);
    }
    else {
        args.push('tests/');
    }
    if (options.headed)
        args.push('--headed');
    if (options.debug)
        args.push('--debug');
    if (options.ui)
        args.push('--ui');
    if (options.report)
        args.push('--reporter=html');
    console.log(`Running: ${args.join(' ')}`);
    console.log(`From: ${process.cwd()}\n`);
    try {
        (0, child_process_1.execSync)(args.join(' '), { stdio: 'inherit' });
    }
    catch (error) {
        process.exit(1);
    }
});
commander_1.program.parse();
