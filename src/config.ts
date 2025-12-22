import path from 'path';
import fs from 'fs';

export interface Config {
  version: string;
  defaultTestDir: string;
  defaultConfig: string;
}

export const config: Config = {
  version: '1.0.0',
  defaultTestDir: 'tests',
  defaultConfig: 'playwright.config.ts'
};

// Type guard to check if running from pkg
export function isRunningFromPkg(): boolean {
  // @ts-ignore - process.pkg is added by pkg at runtime
  return process.pkg !== undefined;
}

export function getExecutablePath(): string {
  if (isRunningFromPkg()) {
    // Running from packaged executable
    return path.dirname(process.execPath);
  }
  // Running from source
  return process.cwd();
}

export function ensureTestFilesExist(): boolean {
  const exePath = getExecutablePath();
  const testDir = path.join(exePath, 'tests');
  
  if (!fs.existsSync(testDir)) {
    console.warn(`⚠️  Warning: Test directory not found at ${testDir}`);
    console.log('Please place your test files in the same directory as the executable.');
    return false;
  }
  
  return true;
}