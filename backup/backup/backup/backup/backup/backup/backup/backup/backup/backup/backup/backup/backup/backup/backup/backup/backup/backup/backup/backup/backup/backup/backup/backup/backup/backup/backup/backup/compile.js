// compile.js - Compile TypeScript files
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Compiling TypeScript files...');

try {
  // Create jsconfig if needed
  if (!fs.existsSync('jsconfig.json')) {
    const jsConfig = {
      "compilerOptions": {
        "module": "commonjs",
        "target": "es2020",
        "outDir": "./dist-js",
        "rootDir": ".",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      },
      "include": ["tests/**/*", "pages/**/*", "utils/**/*", "testData/**/*"],
      "exclude": ["node_modules", "dist"]
    };
    fs.writeFileSync('jsconfig.json', JSON.stringify(jsConfig, null, 2));
  }
  
  // Compile TypeScript
  execSync('npx tsc --project jsconfig.json', { stdio: 'inherit' });
  console.log('✅ TypeScript compiled successfully!');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}