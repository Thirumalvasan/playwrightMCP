"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.isRunningFromPkg = isRunningFromPkg;
exports.getExecutablePath = getExecutablePath;
exports.ensureTestFilesExist = ensureTestFilesExist;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.config = {
    version: '1.0.0',
    defaultTestDir: 'tests',
    defaultConfig: 'playwright.config.ts'
};
function isRunningFromPkg() {
    return process.pkg !== undefined;
}
function getExecutablePath() {
    if (isRunningFromPkg()) {
        return path_1.default.dirname(process.execPath);
    }
    return process.cwd();
}
function ensureTestFilesExist() {
    const exePath = getExecutablePath();
    const testDir = path_1.default.join(exePath, 'tests');
    if (!fs_1.default.existsSync(testDir)) {
        console.warn(`⚠️  Warning: Test directory not found at ${testDir}`);
        console.log('Please place your test files in the same directory as the executable.');
        return false;
    }
    return true;
}
//# sourceMappingURL=config.js.map