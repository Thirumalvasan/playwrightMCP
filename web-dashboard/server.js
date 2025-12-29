const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/logos', express.static(path.join(__dirname, 'public', 'assets', 'logos')));

// Function to load configs dynamically
// function loadProjectsFromConfig() {
//     const projects = {};
//     const configDir = path.join(__dirname, '..', 'configs');
    
//     console.log(`📂 Looking for configs in: ${configDir}`);
    
//     // Check if config directory exists
//     if (!fs.existsSync(configDir)) {
//         console.log('⚠️ Configs directory not found at:', configDir);
//         console.log('📍 Current directory:', __dirname);
//         return {};
//     }

//     try {
//         const configFiles = fs.readdirSync(configDir);
//         console.log(`📄 Found config files: ${configFiles.join(', ')}`);
        
//         for (const file of configFiles) {
//             if (file.endsWith('.config.ts') || file.endsWith('.config.js')) {
//                 try {
//                     const configPath = path.join(configDir, file);
//                     const fileContent = fs.readFileSync(configPath, 'utf8');
//                     const projectName = file.split('.')[0].toLowerCase();
                    
//                     console.log(`🔍 Processing config: ${file} -> ${projectName}`);
                    
//                     // Extract config using regex (simple approach for TypeScript)
//                     let config = {};
                    
//                     // Try to extract the config object
//                     const configMatch = fileContent.match(/export\s+const\s+\w+Config\s*=\s*({[\s\S]*?});/);
//                     if (configMatch) {
//                         try {
//                             // Clean the string to make it valid JSON
//                             let jsonStr = configMatch[1]
//                                 .replace(/\/\/.*$/gm, '') // Remove comments
//                                 .replace(/'/g, '"')       // Replace single quotes with double quotes
//                                 .replace(/(\w+):/g, '"$1":') // Add quotes to property names
//                                 .replace(/,\s*}/g, '}')   // Remove trailing commas
//                                 .replace(/,\s*]/g, ']');  // Remove trailing commas in arrays
                            
//                             config = JSON.parse(jsonStr);
//                         } catch (parseError) {
//                             console.error(`❌ Error parsing JSON for ${projectName}:`, parseError.message);
//                             // Fallback: extract individual values
//                             const baseURLMatch = fileContent.match(/baseURL:\s*['"]([^'"]+)['"]/);
//                             const nameMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
//                             const usernameMatch = fileContent.match(/username:\s*['"]([^'"]+)['"]/);
//                             const passwordMatch = fileContent.match(/password:\s*['"]([^'"]+)['"]/);
                            
//                             if (baseURLMatch) {
//                                 config = {
//                                     name: nameMatch ? nameMatch[1] : projectName.charAt(0).toUpperCase() + projectName.slice(1),
//                                     baseURL: baseURLMatch[1],
//                                     credentials: {
//                                         username: usernameMatch ? usernameMatch[1] : 'admin',
//                                         password: passwordMatch ? passwordMatch[1] : 'password'
//                                     }
//                                 };
//                             }
//                         }
//                     }
                    
//                     if (config && config.baseURL) {
//                         projects[projectName] = {
//                             name: config.name || projectName.charAt(0).toUpperCase() + projectName.slice(1),
//                             baseURL: config.baseURL,
//                             credentials: config.credentials || {
//                                 username: 'admin',
//                                 password: 'password'
//                             },
//                             folder: projectName,
//                             database: config.database,
//                             firstTimeUser: config.credentials?.firstTimeUser,
//                             firstTimePassword: config.credentials?.firstTimePassword,
//                             configPath: configPath
//                         };
//                         console.log(`✅ Loaded config for: ${projectName}`);
//                     }
//                 } catch (error) {
//                     console.error(`❌ Error processing ${file}:`, error.message);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('❌ Error reading config directory:', error.message);
//     }
    
//     // If no configs loaded, use fallback
//     if (Object.keys(projects).length === 0) {
//         console.log('⚠️ Using fallback configurations');
//         projects['milkymist'] = {
//             name: 'MilkyMist WMS',
//             baseURL: 'http://localhost:8016/',
//             credentials: {
//                 username: 'admin',
//                 password: 'admin123',
//                 firstTimeUser: 'newuser',
//                 firstTimePassword: 'TempPass@123'
//             },
//             folder: 'milkymist',
//             database: {
//                 server: 'localhost',
//                 database: 'MilkyMist'
//             }
//         };
//         projects['pernord'] = {
//             name: 'Pernord WMS',
//             baseURL: 'https://swtest.craftsmanautomation.com:8090/pernord-test-web/',
//             credentials: {
//                 username: 'admin',
//                 password: 'sft@cal',
//                 firstTimeUser: 'newuser',
//                 firstTimePassword: 'TempPass@123'
//             },
//             folder: 'pernord',
//             database: {
//                 server: '192.168.221.55',
//                 database: 'WMS_Pernord'
//             }
//         };
//         projects['kkp'] = {
//             name: 'KKP',
//             baseURL: 'http://localhost:8016/',
//             credentials: {
//                 username: 'admin',
//                 password: 'admin123',
//                 firstTimeUser: 'newuser',
//                 firstTimePassword: 'TempPass@123'
//             },
//             folder: 'kkp',
//             database: {
//                 server: 'localhost',
//                 database: 'ASRS_KKP'
//             }
//         };

//     }
    
//     console.log(`📊 Total projects loaded: ${Object.keys(projects).length}`);
//     return projects;
// }

// Load projects

// Function to load configs dynamically
function loadProjectsFromConfig() {
    const projects = {};
    const configDir = path.join(__dirname, '..', 'configs');
    
    console.log(`📂 Looking for configs in: ${configDir}`);
    console.log(`📍 Current directory: ${__dirname}`);
    console.log(`📍 Full config path: ${path.resolve(configDir)}`);
    
    // Check if config directory exists
    if (!fs.existsSync(configDir)) {
        console.log('❌ Configs directory not found at:', path.resolve(configDir));
        console.log('📁 Available directories at parent level:');
        const parentDir = path.join(__dirname, '..');
        if (fs.existsSync(parentDir)) {
            const parentContents = fs.readdirSync(parentDir);
            console.log(parentContents.map(item => `  - ${item}`).join('\n'));
        }
        return {};
    }

    console.log(`✅ Config directory exists!`);
    
    try {
        const configFiles = fs.readdirSync(configDir);
        console.log(`📄 Found ${configFiles.length} files:`, configFiles);
        
        for (const file of configFiles) {
            console.log(`\n🔍 Processing file: ${file}`);
            
            // Check if it's a config file
            const isConfigFile = file.endsWith('.config.ts') || file.endsWith('.config.js');
            console.log(`   Is config file? ${isConfigFile}`);
            
            if (isConfigFile) {
                try {
                    const configPath = path.join(configDir, file);
                    console.log(`   Config path: ${configPath}`);
                    
                    // Read file content
                    const fileContent = fs.readFileSync(configPath, 'utf8');
                    console.log(`   File size: ${fileContent.length} characters`);
                    
                    // Extract project name from filename
                    const projectName = file.split('.')[0].toLowerCase();
                    console.log(`   Project name from filename: ${projectName}`);
                    
                    // Try different parsing strategies
                    console.log(`   🔧 Attempting to parse config...`);
                    
                    // Strategy 1: Try to require the module (for .js files)
                    let config = null;
                    
                    if (file.endsWith('.js')) {
                        try {
                            delete require.cache[require.resolve(configPath)];
                            config = require(configPath);
                            console.log(`   ✅ Successfully required JS module`);
                        } catch (requireError) {
                            console.log(`   ❌ Could not require module: ${requireError.message}`);
                        }
                    }
                    
                    // Strategy 2: Parse TypeScript config (regex approach)
                    if (!config) {
                        console.log(`   🔍 Trying regex parsing for TypeScript...`);
                        
                        // Look for export patterns
                        const exportPatterns = [
                            /export\s+(?:const|let|var)\s+(\w+)\s*=\s*({[\s\S]*?});/g,
                            /export\s+default\s*({[\s\S]*?});/g,
                            /module\.exports\s*=\s*({[\s\S]*?});/g
                        ];
                        
                        let matchFound = null;
                        for (const pattern of exportPatterns) {
                            const matches = [...fileContent.matchAll(pattern)];
                            if (matches.length > 0) {
                                matchFound = matches[0];
                                console.log(`   ✅ Found export pattern match`);
                                break;
                            }
                        }
                        
                        if (matchFound) {
                            try {
                                // Clean the string to make it valid JSON
                                let jsonStr = matchFound[1] || matchFound[0];
                                
                                // Remove TypeScript type annotations
                                jsonStr = jsonStr.replace(/:\s*\w+(\[\])?(?=\s*[,}])/g, '');
                                jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
                                jsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, '');
                                
                                // Fix property names
                                jsonStr = jsonStr.replace(/(\w+):/g, '"$1":');
                                
                                // Fix string values
                                jsonStr = jsonStr.replace(/['"]([^'"]+)['"]/g, '"$1"');
                                
                                // Remove trailing commas
                                jsonStr = jsonStr.replace(/,\s*}/g, '}');
                                jsonStr = jsonStr.replace(/,\s*]/g, ']');
                                
                                console.log(`   🧹 Cleaned JSON string: ${jsonStr.substring(0, 200)}...`);
                                
                                config = JSON.parse(jsonStr);
                                console.log(`   ✅ Successfully parsed JSON`);
                            } catch (parseError) {
                                console.log(`   ❌ JSON parse error: ${parseError.message}`);
                                
                                // Fallback: extract individual values
                                console.log(`   🔍 Falling back to regex value extraction...`);
                                
                                const baseURLMatch = fileContent.match(/baseURL:\s*['"]([^'"]+)['"]/);
                                const nameMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
                                const usernameMatch = fileContent.match(/username:\s*['"]([^'"]+)['"]/);
                                const passwordMatch = fileContent.match(/password:\s*['"]([^'"]+)['"]/);
                                
                                if (baseURLMatch || nameMatch) {
                                    config = {
                                        name: nameMatch ? nameMatch[1] : projectName.charAt(0).toUpperCase() + projectName.slice(1),
                                        baseURL: baseURLMatch ? baseURLMatch[1] : 'http://localhost:8080/',
                                        credentials: {
                                            username: usernameMatch ? usernameMatch[1] : 'admin',
                                            password: passwordMatch ? passwordMatch[1] : 'password'
                                        }
                                    };
                                    console.log(`   ✅ Extracted values via regex`);
                                }
                            }
                        }
                    }
                    
                    // Strategy 3: Look for specific project patterns
                    if (!config) {
                        console.log(`   🔍 Looking for project-specific patterns...`);
                        
                        // Try to extract any object that looks like a config
                        const objectMatch = fileContent.match(/{[\s\S]*?baseURL[\s\S]*?}/);
                        if (objectMatch) {
                            console.log(`   ⚠️ Found potential config object but parsing failed`);
                        }
                    }
                    
                    if (config && (config.baseURL || config.name)) {
                        projects[projectName] = {
                            name: config.name || projectName.charAt(0).toUpperCase() + projectName.slice(1),
                            baseURL: config.baseURL || 'http://localhost:8080/',
                            credentials: config.credentials || {
                                username: 'admin',
                                password: 'password'
                            },
                            folder: config.folder || projectName,
                            database: config.database,
                            firstTimeUser: config.credentials?.firstTimeUser,
                            firstTimePassword: config.credentials?.firstTimePassword,
                            configPath: configPath
                        };
                        console.log(`   ✅ SUCCESS: Loaded config for: ${projectName}`);
                        console.log(`      Name: ${projects[projectName].name}`);
                        console.log(`      URL: ${projects[projectName].baseURL}`);
                        console.log(`      Folder: ${projects[projectName].folder}`);
                    } else {
                        console.log(`   ❌ FAILED: Could not extract config from ${file}`);
                        console.log(`   📄 First 500 chars of file content:`);
                        console.log(fileContent.substring(0, 500));
                    }
                } catch (error) {
                    console.error(`   ❌ Error processing ${file}:`, error.message);
                    console.error(error.stack);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error reading config directory:', error.message);
        console.error(error.stack);
    }
    
    console.log(`\n📊 Loaded ${Object.keys(projects).length} projects:`);
    console.log(Object.keys(projects).map(key => `  - ${key}: ${projects[key].name}`).join('\n'));
    
    // If no configs loaded, use fallback
    if (Object.keys(projects).length === 0) {
        console.log('\n⚠️ ⚠️ ⚠️ USING FALLBACK CONFIGURATIONS ⚠️ ⚠️ ⚠️');
        console.log('This means the automatic config loading failed!');
        console.log('Check the logs above to see what went wrong.\n');
        
        projects['milkymist'] = {
            name: 'MilkyMist WMS',
            baseURL: 'http://localhost:8016/',
            credentials: {
                username: 'admin',
                password: 'admin123',
                firstTimeUser: 'newuser',
                firstTimePassword: 'TempPass@123'
            },
            folder: 'milkymist',
            database: {
                server: 'localhost',
                database: 'MilkyMist'
            }
        };
        projects['pernord'] = {
            name: 'Pernord WMS',
            baseURL: 'https://swtest.craftsmanautomation.com:8090/pernord-test-web/',
            credentials: {
                username: 'admin',
                password: 'sft@cal',
                firstTimeUser: 'newuser',
                firstTimePassword: 'TempPass@123'
            },
            folder: 'pernord',
            database: {
                server: '192.168.221.55',
                database: 'WMS_Pernord'
            }
        };
        // projects['kkp'] = {
        //     name: 'KKP',
        //     baseURL: 'http://localhost:8016/',
        //     credentials: {
        //         username: 'admin',
        //         password: 'admin123',
        //         firstTimeUser: 'newuser',
        //         firstTimePassword: 'TempPass@123'
        //     },
        //     folder: 'kkp',
        //     database: {
        //         server: 'localhost',
        //         database: 'ASRS_KKP'
        //     }
        // };
    }
    
    console.log(`\n🎯 FINAL: Total projects loaded: ${Object.keys(projects).length}`);
    return projects;
}


const PROJECTS = loadProjectsFromConfig();

// Test results history
let testHistory = [];

// Get all projects
app.get('/api/projects', (req, res) => {
    res.json(PROJECTS);
});

// Get project modules dynamically
app.get('/api/project-modules', (req, res) => {
    const { project } = req.query;
    const projectConfig = PROJECTS[project];
    
    if (!projectConfig) {
        return res.status(404).json({ 
            success: false,
            error: 'Project not found'
        });
    }
    
    try {
        const modules = new Set(['all']);
        const testsDir = path.join(process.cwd(), 'tests', projectConfig.folder);
        
        console.log(`🔍 Looking for modules in: ${testsDir}`);
        
        if (fs.existsSync(testsDir)) {
            const items = fs.readdirSync(testsDir);
            items.forEach(item => {
                const fullPath = path.join(testsDir, item);
                if (fs.statSync(fullPath).isDirectory() && 
                    !['node_modules', '.git', 'playwright-report', '.vscode', 'screenshots', 'test-results'].includes(item)) {
                    modules.add(item.toLowerCase());
                }
            });
        }
        
        const moduleArray = Array.from(modules);
        console.log(`📁 Modules found for ${project}: ${moduleArray.join(', ')}`);
        
        res.json({
            success: true,
            modules: moduleArray
        });
    } catch (error) {
        console.error('❌ Error loading modules:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get test files with sub-module support
app.get('/api/test-files', async (req, res) => {
    const { project, module } = req.query;
    const projectConfig = PROJECTS[project];
    
    if (!projectConfig) {
        return res.status(404).json({ 
            success: false,
            error: 'Project not found',
            suggestion: `Available projects: ${Object.keys(PROJECTS).join(', ')}`
        });
    }

    try {
        // Find test directory
        let testsDir = null;
        const possiblePaths = [
            path.join(process.cwd(), 'tests', projectConfig.folder),
            path.join(process.cwd(), '..', 'tests', projectConfig.folder),
            path.join(__dirname, '..', '..', 'tests', projectConfig.folder)
        ];
        
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                testsDir = testPath;
                break;
            }
        }
        
        if (!testsDir) {
            return res.json({ 
                success: false, 
                error: `Test directory not found for project: ${project}`,
                suggestion: `Create directory: tests/${projectConfig.folder}/`
            });
        }

        console.log(`📂 Scanning test files in: ${testsDir}`);
        const files = [];
        
        function scanTestFilesRecursive(dir, baseDir, files, moduleFilter) {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (!['node_modules', '.git', 'playwright-report', '.vscode', 'screenshots', 'test-results'].includes(item)) {
                        scanTestFilesRecursive(fullPath, baseDir, files, moduleFilter);
                    }
                } else if (item.endsWith('.spec.ts') || item.endsWith('.spec.js')) {
                    // Get relative path from the found tests directory
                    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                    
                    // Parse path structure to get module/sub-module
                    const pathParts = relativePath.split('/');
                    
                    let moduleName = 'general';
                    let subModuleName = null;
                    
                    if (pathParts.length > 2) {
                        // Has sub-module: tests/project/module/sub-module/file.spec.ts
                        moduleName = pathParts[0].toLowerCase();
                        subModuleName = pathParts[1].toLowerCase();
                    } else if (pathParts.length > 1) {
                        // Only module: tests/project/module/file.spec.ts
                        moduleName = pathParts[0].toLowerCase();
                    }
                    
                    // Apply module filter if specified
                    if (moduleFilter && moduleFilter !== 'all') {
                        if (moduleName !== moduleFilter.toLowerCase() && subModuleName !== moduleFilter.toLowerCase()) {
                            continue;
                        }
                    }
                    
                    // Create display path
                    const displayPath = relativePath;
                    
                    files.push({
                        id: Date.now() + Math.random(),
                        name: item,
                        path: displayPath,
                        actualPath: fullPath,
                        module: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
                        subModule: subModuleName ? subModuleName.charAt(0).toUpperCase() + subModuleName.slice(1) : null,
                        fullPath: fullPath,
                        relativePath: relativePath,
                        directory: path.dirname(relativePath),
                        lastModified: stat.mtime
                    });
                }
            }
        }
        
        scanTestFilesRecursive(testsDir, testsDir, files, module);
        
        console.log(`📄 Found ${files.length} test files for ${project}`);
        
        res.json({ 
            success: true, 
            files: files,
            count: files.length,
            project: project,
            module: module || 'all'
        });
        
    } catch (error) {
        console.error('❌ Error scanning test files:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});

// Get the correct test path for Playwright command
function getPlaywrightTestPath(fullPath, projectConfig) {
    console.log(`🔍 Getting Playwright test path for: ${fullPath}`);
    
    // Get the project root (where playwright.config.ts is located)
    const projectRoot = getProjectRoot();
    console.log(`📁 Project root: ${projectRoot}`);
    
    // Get relative path from project root
    const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
    console.log(`📁 Relative path from project root: ${relativePath}`);
    
    // Check if the path already starts with 'tests/'
    if (relativePath.startsWith('tests/')) {
        console.log(`✅ Path already starts with 'tests/': ${relativePath}`);
        return relativePath;
    }
    
    // Try to find the tests directory in the path
    const pathParts = relativePath.split('/');
    const testsIndex = pathParts.indexOf('tests');
    
    if (testsIndex !== -1) {
        // Reconstruct path from 'tests' onward
        const testPath = pathParts.slice(testsIndex).join('/');
        console.log(`✅ Reconstructed test path: ${testPath}`);
        return testPath;
    }
    
    // If 'tests' not found, try to find the project folder
    const projectIndex = pathParts.indexOf(projectConfig.folder);
    if (projectIndex !== -1 && projectIndex > 0) {
        // Check if the previous part is 'tests'
        if (pathParts[projectIndex - 1] === 'tests') {
            const testPath = pathParts.slice(projectIndex - 1).join('/');
            console.log(`✅ Found test path with tests/ prefix: ${testPath}`);
            return testPath;
        }
    }
    
    // Last resort: try to construct the path
    // If path contains the project folder name, try to add 'tests/' before it
    if (relativePath.includes(projectConfig.folder)) {
        const pathParts = relativePath.split('/');
        const projectFolderIndex = pathParts.indexOf(projectConfig.folder);
        
        if (projectFolderIndex > 0) {
            // Check if we can insert 'tests' before project folder
            const newPathParts = [...pathParts];
            newPathParts.splice(projectFolderIndex, 0, 'tests');
            const testPath = newPathParts.join('/');
            console.log(`✅ Constructed test path: ${testPath}`);
            return testPath;
        }
    }
    
    // If all else fails, return the original relative path
    console.log(`⚠️ Using original relative path: ${relativePath}`);
    return relativePath;
}

// Find project root (where playwright.config.ts is located)
function getProjectRoot() {
    let currentDir = process.cwd();
    console.log(`🔍 Looking for project root starting from: ${currentDir}`);
    
    // Check if we're in web-dashboard
    if (path.basename(currentDir) === 'web-dashboard') {
        // Go up one level to playwrightMCP
        currentDir = path.join(currentDir, '..');
        console.log(`📁 Went up to parent directory: ${currentDir}`);
    }
    
    // Check if playwright.config.ts exists in current directory
    const playwrightConfigPath = path.join(currentDir, 'playwright.config.ts');
    if (fs.existsSync(playwrightConfigPath)) {
        console.log(`✅ Found playwright.config.ts at: ${playwrightConfigPath}`);
        return currentDir;
    }
    
    // Check if we're already in playwrightMCP but in a subdirectory
    // Try to go up until we find playwright.config.ts
    for (let i = 0; i < 5; i++) {
        const configPath = path.join(currentDir, 'playwright.config.ts');
        if (fs.existsSync(configPath)) {
            console.log(`✅ Found playwright.config.ts at: ${configPath}`);
            return currentDir;
        }
        
        // Go up one level
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break; // Reached root
        }
        currentDir = parentDir;
        console.log(`⬆️ Went up to: ${currentDir}`);
    }
    
    // If not found, use the directory where tests folder exists
    const testsDir = path.join(currentDir, 'tests');
    if (fs.existsSync(testsDir)) {
        console.log(`✅ Found tests directory at: ${testsDir}`);
        return currentDir;
    }
    
    // Last resort: use current working directory
    console.log(`⚠️ Using current directory as project root: ${currentDir}`);
    return currentDir;
}

// Run tests with advanced options - FIXED PATH ISSUE
// app.post('/api/run-tests', async (req, res) => {
//     const { project, module, testFile, options = {} } = req.body;
//     const { headed = false, debug = false, ui = false, timeout = 900000 } = options;
//     const projectConfig = PROJECTS[project];
    
//     if (!projectConfig) {
//         return res.status(404).json({ 
//             success: false, 
//             error: 'Project not found' 
//         });
//     }

//     console.log(`🚀 Running tests for project: ${project}`);
//     console.log(`📊 Options:`, { headed, debug, ui, timeout });
//     console.log(`📄 Test file: ${testFile || 'all tests'}`);
//     console.log(`📂 Module: ${module || 'all'}`);

//     try {
//         let command;
//         let actualTestPath = '';
        
//         if (testFile) {
//             console.log(`🔍 Processing test file: ${testFile}`);
            
//             // Check if testFile is an absolute path
//             if (path.isAbsolute(testFile)) {
//                 console.log(`📁 Test file is absolute path: ${testFile}`);
                
//                 if (!fs.existsSync(testFile)) {
//                     return res.json({
//                         success: false,
//                         error: `Test file not found: ${testFile}`,
//                         suggestion: `Make sure the file exists at the specified path`
//                     });
//                 }
                
//                 actualTestPath = testFile;
//             } else {
//                 // Test file is a relative path or just filename
//                 console.log(`📁 Test file is relative path or filename: ${testFile}`);
                
//                 // Get project root
//                 const projectRoot = getProjectRoot();
//                 console.log(`📁 Project root: ${projectRoot}`);
                
//                 // Try different ways to resolve the path
//                 let resolvedPath = null;
                
//                 // Try 1: Direct join with tests folder
//                 const directPath = path.join(projectRoot, 'tests', projectConfig.folder, testFile);
//                 if (fs.existsSync(directPath)) {
//                     resolvedPath = directPath;
//                 }
                
//                 // Try 2: If testFile contains project folder already
//                 if (!resolvedPath && testFile.includes(projectConfig.folder)) {
//                     const pathWithTests = path.join(projectRoot, 'tests', testFile);
//                     if (fs.existsSync(pathWithTests)) {
//                         resolvedPath = pathWithTests;
//                     }
//                 }
                
//                 // Try 3: Search recursively
//                 if (!resolvedPath) {
//                     const testsDir = path.join(projectRoot, 'tests', projectConfig.folder);
//                     if (fs.existsSync(testsDir)) {
//                         function findFileRecursively(dir, filename) {
//                             const items = fs.readdirSync(dir);
//                             for (const item of items) {
//                                 const fullPath = path.join(dir, item);
//                                 const stat = fs.statSync(fullPath);
                                
//                                 if (stat.isDirectory()) {
//                                     const found = findFileRecursively(fullPath, filename);
//                                     if (found) return found;
//                                 } else if (item === filename || 
//                                           item === `${filename}` ||
//                                           item === `${filename}.spec.ts` || 
//                                           item === `${filename}.spec.js`) {
//                                     return fullPath;
//                                 }
//                             }
//                             return null;
//                         }
                        
//                         resolvedPath = findFileRecursively(testsDir, testFile);
//                     }
//                 }
                
//                 if (!resolvedPath) {
//                     return res.json({
//                         success: false,
//                         error: `Test file "${testFile}" not found in project ${project}`,
//                         suggestion: `Check if file exists in tests/${projectConfig.folder}/ directory`
//                     });
//                 }
                
//                 actualTestPath = resolvedPath;
//             }
            
//             console.log(`✅ Found test file at: ${actualTestPath}`);
            
//             // Get the correct path for Playwright command
//             const playwrightTestPath = getPlaywrightTestPath(actualTestPath, projectConfig);
//             console.log(`📁 Playwright test path: ${playwrightTestPath}`);
            
//             // Build command based on OS
//             if (process.platform === 'win32') {
//                 // Windows command - EXACT FORMAT AS YOUR MANUAL COMMAND
//                 command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${playwrightTestPath}"`;
//             } else {
//                 // Linux/Mac command
//                 command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${playwrightTestPath}"`;
//             }
            
//         } else if (module && module !== 'all') {
//             // Run tests for specific module
//             console.log(`📂 Running module tests: ${module}`);
            
//             // Get project root
//             const projectRoot = getProjectRoot();
            
//             // Try to find module directory
//             let modulePath = null;
//             const possiblePaths = [
//                 `tests/${projectConfig.folder}/${module}`,
//                 `tests/${projectConfig.folder}/master/${module}`,
//                 `tests/${projectConfig.folder}/${module.toLowerCase()}`,
//                 `tests/${projectConfig.folder}/master/${module.toLowerCase()}`
//             ];
            
//             for (const possiblePath of possiblePaths) {
//                 const fullPath = path.join(projectRoot, possiblePath);
//                 if (fs.existsSync(fullPath)) {
//                     modulePath = possiblePath;
//                     console.log(`✅ Found module at: ${fullPath}`);
//                     break;
//                 }
//             }
            
//             if (!modulePath) {
//                 return res.json({
//                     success: false,
//                     error: `Module directory not found: ${module}`,
//                     suggestion: `Check if directory exists: tests/${projectConfig.folder}/${module}/`
//                 });
//             }
            
//             if (process.platform === 'win32') {
//                 command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${modulePath}"`;
//             } else {
//                 command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${modulePath}"`;
//             }
//         } else {
//             // Run all tests for project
//             const projectTestPath = `tests/${projectConfig.folder}`;
//             console.log(`📂 Running all tests from: ${projectTestPath}`);
            
//             if (process.platform === 'win32') {
//                 command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${projectTestPath}"`;
//             } else {
//                 command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${projectTestPath}"`;
//             }
//         }
        
//         // Add execution options
//         if (ui) {
//             command += ' --ui';
//         } else if (debug) {
//             command += ' --debug';
//         } else if (headed) {
//             command += ' --headed';
//         }
        
//         // Add timeout if specified
//         if (timeout) {
//             command += ` --timeout=${timeout}`;
//         }
        
//         // Add reporter for better output
//         command += ' --reporter=line';
        
//         // Add workers for parallel execution
//         command += ' --workers=2';
        
//         console.log(`⚡ Executing command: ${command}`);
        
//         // Set environment variables from config
//         const env = {
//             ...process.env,
//             BASE_URL: projectConfig.baseURL,
//             USERNAME: projectConfig.credentials.username,
//             PASSWORD: projectConfig.credentials.password,
//             PROJECT_NAME: projectConfig.name,
//             PLAYWRIGHT_PROJECT: projectConfig.folder
//         };
        
//         // Add optional credentials if available
//         if (projectConfig.firstTimeUser) {
//             env.FIRST_TIME_USER = projectConfig.firstTimeUser;
//         }
//         if (projectConfig.firstTimePassword) {
//             env.FIRST_TIME_PASSWORD = projectConfig.firstTimePassword;
//         }

//         // Log the exact command that will be executed
//         console.log(`🎯 FINAL COMMAND TO EXECUTE:`);
//         console.log(command);
        
//         // Execute the command
//         const child = spawn(
//             process.platform === 'win32' ? 'powershell.exe' : 'sh',
//             process.platform === 'win32' ? ['-Command', command] : ['-c', command],
//             {
//                 cwd: getProjectRoot(), // Set working directory to project root
//                 env: env,
//                 stdio: ['pipe', 'pipe', 'pipe']
//             }
//         );

//         let output = '';
//         let stderr = '';
//         let success = false;
//         const executionId = 'exec_' + Date.now();

//         // Stream output in real-time
//         child.stdout.on('data', (data) => {
//             const dataStr = data.toString();
//             output += dataStr;
//             console.log('STDOUT:', dataStr.trim());
//         });

//         child.stderr.on('data', (data) => {
//             const dataStr = data.toString();
//             stderr += dataStr;
//             console.error('STDERR:', dataStr.trim());
//         });

//         child.on('close', (code) => {
//             success = code === 0;
            
//             console.log(`🏁 Process exited with code: ${code}`);
            
//             // Store execution logs
//             const logEntry = {
//                 id: executionId,
//                 timestamp: new Date().toISOString(),
//                 project: projectConfig.name,
//                 projectKey: project,
//                 module: module || 'all',
//                 testFile: testFile || 'all',
//                 options: options,
//                 success: success,
//                 output: output,
//                 stderr: stderr,
//                 exitCode: code,
//                 command: command,
//                 cwd: getProjectRoot()
//             };
            
//             testHistory.push(logEntry);
            
//             if (testHistory.length > 100) {
//                 testHistory = testHistory.slice(-100);
//             }

//             res.json({
//                 success: success,
//                 executionId: executionId,
//                 output: output,
//                 stderr: stderr,
//                 exitCode: code,
//                 project: projectConfig.name,
//                 command: command,
//                 cwd: getProjectRoot()
//             });
//         });

//         child.on('error', (error) => {
//             console.error('❌ Failed to start process:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message,
//                 suggestion: 'Make sure Playwright is installed: npm install playwright'
//             });
//         });

//         // Set timeout for long-running tests
//         const timeoutMs = timeout ? parseInt(timeout) * 1000 : 600000;
//         setTimeout(() => {
//             if (!child.killed) {
//                 child.kill('SIGTERM');
//                 console.log('⏰ Test execution timed out');
//             }
//         }, timeoutMs);

//     } catch (error) {
//         console.error('❌ Error running tests:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

app.post('/api/run-tests', async (req, res) => {
    const { project, module, testFile, options = {} } = req.body;
    const { headed = false, debug = false, ui = false, timeout } = options;
    const projectConfig = PROJECTS[project];
    
    if (!projectConfig) {
        return res.status(404).json({ 
            success: false, 
            error: 'Project not found' 
        });
    }

    console.log(`🚀 Running tests for project: ${project}`);
    console.log(`📊 Options:`, { headed, debug, ui, timeout });
    console.log(`📄 Test file: ${testFile || 'all tests'}`);
    console.log(`📂 Module: ${module || 'all'}`);

    try {
        let command;
        let actualTestPath = '';
        
        if (testFile) {
            console.log(`🔍 Processing test file: ${testFile}`);
            
            // Check if testFile is an absolute path
            if (path.isAbsolute(testFile)) {
                console.log(`📁 Test file is absolute path: ${testFile}`);
                
                if (!fs.existsSync(testFile)) {
                    return res.json({
                        success: false,
                        error: `Test file not found: ${testFile}`,
                        suggestion: `Make sure the file exists at the specified path`
                    });
                }
                
                actualTestPath = testFile;
            } else {
                // Test file is a relative path or just filename
                console.log(`📁 Test file is relative path or filename: ${testFile}`);
                
                // Get project root
                const projectRoot = getProjectRoot();
                console.log(`📁 Project root: ${projectRoot}`);
                
                // Try different ways to resolve the path
                let resolvedPath = null;
                
                // Try 1: Direct join with tests folder
                const directPath = path.join(projectRoot, 'tests', projectConfig.folder, testFile);
                if (fs.existsSync(directPath)) {
                    resolvedPath = directPath;
                }
                
                // Try 2: If testFile contains project folder already
                if (!resolvedPath && testFile.includes(projectConfig.folder)) {
                    const pathWithTests = path.join(projectRoot, 'tests', testFile);
                    if (fs.existsSync(pathWithTests)) {
                        resolvedPath = pathWithTests;
                    }
                }
                
                // Try 3: Search recursively
                if (!resolvedPath) {
                    const testsDir = path.join(projectRoot, 'tests', projectConfig.folder);
                    if (fs.existsSync(testsDir)) {
                        function findFileRecursively(dir, filename) {
                            const items = fs.readdirSync(dir);
                            for (const item of items) {
                                const fullPath = path.join(dir, item);
                                const stat = fs.statSync(fullPath);
                                
                                if (stat.isDirectory()) {
                                    const found = findFileRecursively(fullPath, filename);
                                    if (found) return found;
                                } else if (item === filename || 
                                          item === `${filename}` ||
                                          item === `${filename}.spec.ts` || 
                                          item === `${filename}.spec.js`) {
                                    return fullPath;
                                }
                            }
                            return null;
                        }
                        
                        resolvedPath = findFileRecursively(testsDir, testFile);
                    }
                }
                
                if (!resolvedPath) {
                    return res.json({
                        success: false,
                        error: `Test file "${testFile}" not found in project ${project}`,
                        suggestion: `Check if file exists in tests/${projectConfig.folder}/ directory`
                    });
                }
                
                actualTestPath = resolvedPath;
            }
            
            console.log(`✅ Found test file at: ${actualTestPath}`);
            
            // Get the correct path for Playwright command
            const playwrightTestPath = getPlaywrightTestPath(actualTestPath, projectConfig);
            console.log(`📁 Playwright test path: ${playwrightTestPath}`);
            
            // Build command based on OS
            if (process.platform === 'win32') {
                // Windows command - EXACT FORMAT AS YOUR MANUAL COMMAND
                command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${playwrightTestPath}"`;
            } else {
                // Linux/Mac command
                command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${playwrightTestPath}"`;
            }
            
        } else if (module && module !== 'all') {
            // Run tests for specific module
            console.log(`📂 Running module tests: ${module}`);
            
            // Get project root
            const projectRoot = getProjectRoot();
            
            // Try to find module directory
            let modulePath = null;
            const possiblePaths = [
                `tests/${projectConfig.folder}/${module}`,
                `tests/${projectConfig.folder}/master/${module}`,
                `tests/${projectConfig.folder}/${module.toLowerCase()}`,
                `tests/${projectConfig.folder}/master/${module.toLowerCase()}`
            ];
            
            for (const possiblePath of possiblePaths) {
                const fullPath = path.join(projectRoot, possiblePath);
                if (fs.existsSync(fullPath)) {
                    modulePath = possiblePath;
                    console.log(`✅ Found module at: ${fullPath}`);
                    break;
                }
            }
            
            if (!modulePath) {
                return res.json({
                    success: false,
                    error: `Module directory not found: ${module}`,
                    suggestion: `Check if directory exists: tests/${projectConfig.folder}/${module}/`
                });
            }
            
            if (process.platform === 'win32') {
                command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${modulePath}"`;
            } else {
                command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${modulePath}"`;
            }
        } else {
            // Run all tests for project
            const projectTestPath = `tests/${projectConfig.folder}`;
            console.log(`📂 Running all tests from: ${projectTestPath}`);
            
            if (process.platform === 'win32') {
                command = `$env:PLAYWRIGHT_PROJECT="${projectConfig.folder}"; npx playwright test "${projectTestPath}"`;
            } else {
                command = `PLAYWRIGHT_PROJECT="${projectConfig.folder}" npx playwright test "${projectTestPath}"`;
            }
        }
        
        // Add execution options
        if (ui) {
            command += ' --ui';
        } else if (debug) {
            command += ' --debug';
        } else if (headed) {
            command += ' --headed';
        }
        
        // Add timeout if specified - CONVERT SECONDS TO MILLISECONDS
        if (timeout) {
            // Convert seconds to milliseconds
            const timeoutMs = timeout * 1000;
            command += ` --timeout=${timeoutMs}`;
        }
        
        // Add reporter for better output
        command += ' --reporter=line';
        
        // Add workers for parallel execution
        command += ' --workers=2';
        
        console.log(`⚡ Executing command: ${command}`);
        
        // Set environment variables from config
        const env = {
            ...process.env,
            BASE_URL: projectConfig.baseURL,
            USERNAME: projectConfig.credentials.username,
            PASSWORD: projectConfig.credentials.password,
            PROJECT_NAME: projectConfig.name,
            PLAYWRIGHT_PROJECT: projectConfig.folder
        };
        
        // Add optional credentials if available
        if (projectConfig.firstTimeUser) {
            env.FIRST_TIME_USER = projectConfig.firstTimeUser;
        }
        if (projectConfig.firstTimePassword) {
            env.FIRST_TIME_PASSWORD = projectConfig.firstTimePassword;
        }

        // Log the exact command that will be executed
        console.log(`🎯 FINAL COMMAND TO EXECUTE:`);
        console.log(command);
        
        // Execute the command
        const child = spawn(
            process.platform === 'win32' ? 'powershell.exe' : 'sh',
            process.platform === 'win32' ? ['-Command', command] : ['-c', command],
            {
                cwd: getProjectRoot(), // Set working directory to project root
                env: env,
                stdio: ['pipe', 'pipe', 'pipe']
            }
        );

        let output = '';
        let stderr = '';
        let success = false;
        const executionId = 'exec_' + Date.now();

        // Stream output in real-time
        child.stdout.on('data', (data) => {
            const dataStr = data.toString();
            output += dataStr;
            console.log('STDOUT:', dataStr.trim());
        });

        child.stderr.on('data', (data) => {
            const dataStr = data.toString();
            stderr += dataStr;
            console.error('STDERR:', dataStr.trim());
        });

        child.on('close', (code) => {
            success = code === 0;
            
            console.log(`🏁 Process exited with code: ${code}`);
            
            // Store execution logs
            const logEntry = {
                id: executionId,
                timestamp: new Date().toISOString(),
                project: projectConfig.name,
                projectKey: project,
                module: module || 'all',
                testFile: testFile || 'all',
                options: options,
                success: success,
                output: output,
                stderr: stderr,
                exitCode: code,
                command: command,
                cwd: getProjectRoot()
            };
            
            testHistory.push(logEntry);
            
            if (testHistory.length > 100) {
                testHistory = testHistory.slice(-100);
            }

            res.json({
                success: success,
                executionId: executionId,
                output: output,
                stderr: stderr,
                exitCode: code,
                project: projectConfig.name,
                command: command,
                cwd: getProjectRoot()
            });
        });

        child.on('error', (error) => {
            console.error('❌ Failed to start process:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                suggestion: 'Make sure Playwright is installed: npm install playwright'
            });
        });

        // Set timeout for long-running tests (server-side timeout)
        const timeoutMs = timeout ? parseInt(timeout) * 1000 : 600000;
        setTimeout(() => {
            if (!child.killed) {
                child.kill('SIGTERM');
                console.log('⏰ Test execution timed out');
            }
        }, timeoutMs);

    } catch (error) {
        console.error('❌ Error running tests:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get execution logs by ID
app.get('/api/execution/:id', (req, res) => {
    const { id } = req.params;
    const log = testHistory.find(log => log.id === id);
    
    if (!log) {
        return res.status(404).json({
            success: false,
            error: 'Execution log not found'
        });
    }
    
    res.json({
        success: true,
        log: log
    });
});

// Get recent execution logs
app.get('/api/executions', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const logs = testHistory.slice(-limit).reverse();
    
    res.json({
        success: true,
        logs: logs,
        total: testHistory.length
    });
});

// Clear execution history
app.delete('/api/executions', (req, res) => {
    testHistory = [];
    res.json({
        success: true,
        message: 'Execution history cleared'
    });
});

// Open HTML report
app.get('/api/open-report', (req, res) => {
    try {
        const possiblePaths = [
            path.join(process.cwd(), 'playwright-report', 'index.html'),
            path.join(__dirname, '..', 'playwright-report', 'index.html'),
            path.join(process.cwd(), 'test-results', 'index.html')
        ];
        
        let reportPath = null;
        for (const report of possiblePaths) {
            if (fs.existsSync(report)) {
                reportPath = report;
                break;
            }
        }
        
        if (!reportPath) {
            return res.status(404).json({ 
                success: false, 
                error: 'Report not found. Run tests first to generate report.',
                suggestion: 'Run some tests and try again'
            });
        }
        
        console.log(`📊 Opening report: ${reportPath}`);
        
        let command;
        if (process.platform === 'win32') {
            command = `start "" "${reportPath}"`;
        } else if (process.platform === 'darwin') {
            command = `open "${reportPath}"`;
        } else {
            command = `xdg-open "${reportPath}"`;
        }
        
        exec(command, (error) => {
            if (error) {
                console.error('❌ Failed to open report:', error);
                res.json({ 
                    success: false, 
                    error: error.message,
                    suggestion: 'Open the report manually from playwright-report/index.html'
                });
            } else {
                res.json({ 
                    success: true,
                    message: 'Opening HTML report...',
                    path: reportPath
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get server status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        projects: Object.keys(PROJECTS).length,
        totalExecutions: testHistory.length,
        server: 'Playwright Dashboard v3.0'
    });
});

// Get system info
app.get('/api/system-info', (req, res) => {
    res.json({
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cwd: process.cwd(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAvg: os.loadavg(),
        projects: Object.keys(PROJECTS),
        testHistoryCount: testHistory.length
    });
});

// Ping endpoint for connection check
app.get('/api/ping', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/projects',
            'GET /api/project-modules',
            'GET /api/test-files',
            'POST /api/run-tests',
            'GET /api/executions',
            'GET /api/execution/:id',
            'DELETE /api/executions',
            'GET /api/open-report',
            'GET /api/status',
            'GET /api/system-info',
            'GET /api/ping'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎉 ==============================================`);
    console.log(`🚀 PLAYWRIGHT DASHBOARD SERVER v3.0`);
    console.log(`📡 Running on: http://localhost:${PORT}`);
    console.log(`📊 Projects loaded: ${Object.keys(PROJECTS).join(', ')}`);
    console.log(`📁 Server directory: ${__dirname}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`🔧 Node version: ${process.version}`);
    console.log(`==============================================\n`);
    
    // Log project details
    console.log(`📋 PROJECT CONFIGURATIONS:`);
    Object.entries(PROJECTS).forEach(([key, config]) => {
        console.log(`\n  ${config.name} (${key}):`);
        console.log(`    📍 URL: ${config.baseURL}`);
        console.log(`    👤 User: ${config.credentials.username}`);
        console.log(`    📁 Folder: ${config.folder}`);
        if (config.database) {
            console.log(`    🗄️  Database: ${config.database.database}@${config.database.server}`);
        }
    });
    
    console.log(`\n🌐 Dashboard URL: http://localhost:${PORT}`);
    console.log(`💡 Press Ctrl+C to stop the server\n`);
});