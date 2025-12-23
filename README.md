Playwright MCP - WMS Automation Framework  
============================================
A robust, multi-project automation testing framework for WMS (Warehouse Management System) applications using Playwright and TypeScript.

🏗️ Project Structure
text
playwrightMCP/
├── configs/                    # Project configurations
│   ├── MilkyMist.config.ts    # MilkyMist project settings
│   └── Pernord.config.ts      # Pernord project settings
├── pages/                     # Page Object Models
│   └── login/
│       ├── LoginPage.ts
│       └── ChangePasswordPage.ts
├── tests/                     # Test suites
│   ├── MilkyMist/            # MilkyMist project tests
│   │   ├── login/
│   │   │   ├── login.spec.ts
│   │   │   └── changepassword.spec.ts
│   │   ├── master/
│   │   └── reports/
│   ├── Pernord/              # Pernord project tests
│   │   ├── login/
│   │   │   ├── login.spec.ts
│   │   │   └── changepassword.spec.ts
│   │   ├── master/
│   │   └── reports/
│   └── common/               # Shared tests
├── testData/                 # Test data management
│   ├── loginData.ts         # Dynamic login data loader
│   ├── milkymist/           # MilkyMist specific data
│   └── pernord/             # Pernord specific data
├── utils/                    # Utilities and helpers
│   ├── configLoader.ts      # Project configuration loader
│   └── pageFactory.ts       # Page object factory
├── Database/                # Database utilities
│   └── db.ts               # Database connection
└── playwright.config.ts     # Playwright configuration
================================================================================================================================================================================

📋 Supported Projects

Project	Base URL	Description

MilkyMist	http://localhost:8016/	Internal WMS application

Pernord	https://swtest.craftsmanautomation.com:8090/pernord-test-web/	External client WMS


🚀 Quick Start

Prerequisites

Node.js 16+

npm or yarn

Git

Installation
bash
# Clone the repository
git clone <repository-url>
cd playwrightMCP

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
📖 Usage
Running Tests
Using NPM Scripts (Recommended)
For MilkyMist:

bash
# Run all MilkyMist tests
npm run test:milkymist

# Run MilkyMist login tests
npm run test:milkymist:login

# Run with UI mode
npm run test:milkymist:ui

# Run in debug mode
npm run test:milkymist:debug
For Pernord:

bash
# Run all Pernord tests
npm run test:pernord

# Run Pernord login tests
npm run test:pernord:login

# Run with UI mode
npm run test:pernord:ui

# Run in debug mode
npm run test:pernord:debug
Run both projects:

bash
# Run all tests from both projects
npm run test:all

# Run tests in parallel
npm run test:all:parallel
Using Direct Commands
Windows PowerShell:

powershell
# Set environment variable and run
$env:PLAYWRIGHT_PROJECT="milkymist"
npx playwright test tests/MilkyMist/login/login.spec.ts

# For Pernord
$env:PLAYWRIGHT_PROJECT="pernord"
npx playwright test tests/Pernord/login/login.spec.ts
Windows Command Prompt:

cmd
set PLAYWRIGHT_PROJECT=milkymist && npx playwright test tests/MilkyMist/login/login.spec.ts
set PLAYWRIGHT_PROJECT=pernord && npx playwright test tests/Pernord/login/login.spec.ts
Test Execution Options
bash
# Run specific test file
npx playwright test tests/MilkyMist/login/login.spec.ts

# Run with specific browser
npx playwright test --project=milkymist-chrome

# Run with trace
npx playwright test --trace on

# Run with video recording
npx playwright test --video on

# Run with specific test name
npx playwright test -g "login"

# Generate HTML report
npx playwright show-report
⚙️ Configuration
Project Configuration Files
configs/MilkyMist.config.ts:

typescript
export const MilkyMistConfig = {
  name: 'MilkyMist',
  baseURL: 'http://localhost:8016/',
  credentials: {
    username: 'admin',
    password: 'Sft@Cal',
    firstTimeUser: 'thiru',
    firstTimePassword: 'Thiru@4321'
  },
  database: {
    server: '192.168.221.10',
    database: 'ASRS_Milkymist'
  }
};
configs/Pernord.config.ts:

typescript
export const PernordConfig = {
  name: 'Pernord',
  baseURL: 'https://swtest.craftsmanautomation.com:8090/pernord-test-web/',
  credentials: {
    username: 'admin',
    password: 'sft@cal',
    firstTimeUser: 'newuser',
    firstTimePassword: 'TempPass@123'
  },
  database: {
    server: '192.168.221.55',
    database: 'WMS_Pernord'
  }
};
Environment Variables
Create .env file for sensitive data:

env
# Database credentials
DB_SERVER=192.168.221.10
DB_USER=sa
DB_PASSWORD=your_password

# Test credentials
PW_TEST_PASSWORD=Sft@Cal

# Project selection
PLAYWRIGHT_PROJECT=milkymist
🧪 Test Examples
Login Test Example
typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login/LoginPage';
import { loginData } from '@testData/loginData';

test.describe('Login Tests', () => {
  test('Valid login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate(loginData.baseUrl);
    await loginPage.login(loginData.username, loginData.password);
    
    const isSuccess = await loginPage.waitForLoginSuccess();
    expect(isSuccess).toBeTruthy();
  });
});
Database Integration Test
typescript
import { test, expect } from '@playwright/test';
import { queryDb } from '@database/db';

test('Database verification', async () => {
  const result = await queryDb('SELECT * FROM User_Management');
  expect(result.length).toBeGreaterThan(0);
});
🔧 Available NPM Scripts
Script	Description
npm run test:milkymist	Run all MilkyMist tests
npm run test:pernord	Run all Pernord tests
npm run test:all	Run tests from both projects
npm run test:ui	Open Playwright UI
npm run test:report	Show HTML report
npm run test:codegen	Generate tests with codegen
npm run setup	Install dependencies and browsers
npm run lint	TypeScript type checking
npm run clean	Clean reports and cache
📊 Reports & Artifacts
Tests generate the following outputs:

HTML Reports: playwright-report/

Test Results: test-results/

Screenshots: On test failure

Videos: On test failure (if configured)

Traces: For debugging

View reports:

bash
npx playwright show-report
🧩 Adding New Projects
Create config file in configs/:

typescript
// configs/NewProject.config.ts
export const NewProjectConfig = {
  name: 'NewProject',
  baseURL: 'https://new-project-url.com/',
  credentials: {
    username: 'admin',
    password: 'password'
  }
};
Add to playwright.config.ts:

typescript
projects: [
  {
    name: 'newproject-chrome',
    testDir: './tests/NewProject',
    use: { 
      ...devices['Desktop Chrome'],
      baseURL: NewProjectConfig.baseURL,
    },
  }
]
Create test directory:

bash
mkdir tests/NewProject
mkdir tests/NewProject/login
Update npm scripts in package.json

🛠️ Development Tools
Code Generation
bash
# Generate tests by recording actions
npm run test:codegen
Debugging
bash
# Debug with UI
npm run test:milkymist:ui

# Debug with inspector
npm run test:milkymist:debug
Test Filtering
bash
# Run tests with @smoke tag
npm run test:milkymist --grep @smoke

# Run tests with @regression tag
npm run test:pernord --grep @regression
📈 Best Practices
Use Page Objects: All UI interactions should be in page objects

Keep Tests Independent: Each test should run independently

Use Test Data Management: Store test data in testData/ directory

Add Proper Assertions: Every test should have meaningful assertions

Handle Environment Variables: Use .env for sensitive data

Use Descriptive Test Names: Clear test names help with reporting

Implement Retry Logic: Use Playwright's built-in retries

🔍 Troubleshooting
Common Issues
Import path errors:

bash
# Fix TypeScript paths
npm run type-check
Browser launch issues:

bash
# Reinstall browsers
npx playwright install
Database connection failures:

Verify database server is accessible

Check credentials in .env file

Ensure firewall allows connections

Environment variables not working:

bash
# On Windows PowerShell
$env:PLAYWRIGHT_PROJECT="milkymist"
Debug Commands
bash
# See what projects are available
npx playwright test --list

# Run with verbose output
npx playwright test --verbose

# Run with specific timeout
npx playwright test --timeout=60000
🤝 Contributing
Fork the repository

Create a feature branch

Add tests for new functionality

Ensure all tests pass

Submit a pull request

📄 License
This project is for internal use at Craftsman Automation.



 +++++++++++++++++++++++++++++++++++++++++++++++++   Built with ❤️ by Craftsman Automation Testing Team   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++