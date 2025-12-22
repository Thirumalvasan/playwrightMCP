"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunner = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
class TestRunner {
    exePath;
    constructor() {
        this.exePath = (0, config_1.getExecutablePath)();
    }
    runTests(testPath, options = {}) {
        const args = ['npx', 'playwright', 'test'];
        let absoluteTestPath;
        if (path_1.default.isAbsolute(testPath)) {
            absoluteTestPath = testPath;
        }
        else {
            absoluteTestPath = path_1.default.join(this.exePath, testPath);
        }
        args.push(absoluteTestPath);
        if (options.headed)
            args.push('--headed');
        if (options.debug)
            args.push('--debug');
        if (options.ui)
            args.push('--ui');
        if (options.report)
            args.push('--reporter=html');
        if (options.project)
            args.push('--project', options.project);
        if (options.workers)
            args.push('--workers', options.workers.toString());
        console.log(`Running: ${args.join(' ')}`);
        const child = (0, child_process_1.spawn)(args[0], args.slice(1), {
            stdio: 'inherit',
            shell: true,
            cwd: this.exePath
        });
        child.on('close', (code) => {
            process.exit(code || 0);
        });
    }
    installBrowsers(withDeps = false) {
        const args = ['npx', 'playwright', 'install'];
        if (withDeps) {
            args.push('--with-deps');
        }
        console.log(`Installing browsers: ${args.join(' ')}`);
        try {
            (0, child_process_1.execSync)(args.join(' '), {
                stdio: 'inherit',
                cwd: this.exePath
            });
            console.log('✅ Browsers installed successfully!');
        }
        catch (error) {
            console.error('❌ Browser installation failed');
            throw error;
        }
    }
}
exports.TestRunner = TestRunner;
//# sourceMappingURL=runner.js.map