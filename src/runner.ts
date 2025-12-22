import { execSync, spawn } from 'child_process';
import path from 'path';
import { getExecutablePath } from './config';

export class TestRunner {
  private exePath: string;
  
  constructor() {
    this.exePath = getExecutablePath();
  }
  
  runTests(testPath: string, options: any = {}): void {
    const args = ['npx', 'playwright', 'test'];
    
    // Determine absolute path
    let absoluteTestPath: string;
    if (path.isAbsolute(testPath)) {
      absoluteTestPath = testPath;
    } else {
      absoluteTestPath = path.join(this.exePath, testPath);
    }
    
    args.push(absoluteTestPath);
    
    // Add options
    if (options.headed) args.push('--headed');
    if (options.debug) args.push('--debug');
    if (options.ui) args.push('--ui');
    if (options.report) args.push('--reporter=html');
    if (options.project) args.push('--project', options.project);
    if (options.workers) args.push('--workers', options.workers.toString());
    
    console.log(`Running: ${args.join(' ')}`);
    
    const child = spawn(args[0], args.slice(1), {
      stdio: 'inherit',
      shell: true,
      cwd: this.exePath
    });
    
    child.on('close', (code) => {
      process.exit(code || 0);
    });
  }
  
  installBrowsers(withDeps: boolean = false): void {
    const args = ['npx', 'playwright', 'install'];
    if (withDeps) {
      args.push('--with-deps');
    }
    
    console.log(`Installing browsers: ${args.join(' ')}`);
    
    try {
      execSync(args.join(' '), { 
        stdio: 'inherit',
        cwd: this.exePath
      });
      console.log('✅ Browsers installed successfully!');
    } catch (error) {
      console.error('❌ Browser installation failed');
      throw error;
    }
  }
}