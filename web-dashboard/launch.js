// dashboard/launch.js - FIXED VERSION
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import open correctly
const open = require('open');

// Launch dashboard in browser
const dashboardPath = path.join(__dirname, 'index.html');

// Check if dashboard exists
if (!fs.existsSync(dashboardPath)) {
    console.error('❌ Dashboard HTML file not found!');
    console.log('Creating dashboard file...');
    
    // Create a simple dashboard
    const dashboardHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Playwright MCP Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .projects { display: flex; gap: 20px; margin-top: 30px; }
        .project-card { flex: 1; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .btn { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
        .btn-run { background: #4CAF50; color: white; }
        .btn-report { background: #2196F3; color: white; }
        .status { padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .status-running { background: #fff3cd; color: #856404; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Playwright MCP Dashboard</h1>
        <p>Multi-Project WMS Automation Framework</p>
        
        <div class="projects">
            <div class="project-card">
                <h2>MilkyMist WMS</h2>
                <p>URL: http://localhost:8016/</p>
                <p>Status: <span class="status status-running">Running Tests</span></p>
                <button class="btn btn-run" onclick="runProject('milkymist')">▶️ Run Tests</button>
                <button class="btn btn-report" onclick="viewReport('milkymist')">📊 View Report</button>
            </div>
            
            <div class="project-card">
                <h2>Pernord WMS</h2>
                <p>URL: https://swtest.craftsmanautomation.com:8090/pernord-test-web/</p>
                <p>Status: <span class="status status-passed">Tests Passed</span></p>
                <button class="btn btn-run" onclick="runProject('pernord')">▶️ Run Tests</button>
                <button class="btn btn-report" onclick="viewReport('pernord')">📊 View Report</button>
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>Recent Test Results</h3>
            <div id="test-results">
                <p>Loading test results...</p>
            </div>
        </div>
    </div>
    
    <script>
        function runProject(project) {
            alert('Running ' + project.toUpperCase() + ' tests...');
            fetch('/api/run/' + project, { method: 'POST' });
        }
        
        function viewReport(project) {
            window.open('playwright-report/index.html', '_blank');
        }
        
        // Auto-refresh every 10 seconds
        setInterval(() => {
            fetch('/api/results')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('test-results').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                });
        }, 10000);
    </script>
</body>
</html>`;
    
    fs.writeFileSync(dashboardPath, dashboardHTML);
    console.log('✅ Dashboard HTML file created!');
}

// Open dashboard
console.log('🚀 Launching Playwright MCP Dashboard...');
console.log('📊 Opening browser...');

open(dashboardPath, { wait: false })
    .then(() => {
        console.log('✅ Dashboard opened successfully!');
        console.log('\n📋 Available Projects:');
        console.log('   1. MilkyMist WMS');
        console.log('   2. Pernord WMS');
        console.log('\n🎯 Run tests from dashboard or use these commands:');
        console.log('   npm run test:milkymist');
        console.log('   npm run test:pernord');
        console.log('\n🔧 Press Ctrl+C to stop the dashboard');
        
        // Optional: Start a simple HTTP server
        startServer();
    })
    .catch(err => {
        console.error('❌ Failed to open dashboard:', err.message);
        console.log('\n📝 You can manually open:');
        console.log(`   ${dashboardPath}`);
        console.log('\nOr run a simple server:');
        console.log('   npx http-server dashboard/ -p 8080');
    });

function startServer() {
    const http = require('http');
    const fs = require('fs');
    const url = require('url');
    
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        // Serve dashboard
        if (parsedUrl.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fs.readFileSync(dashboardPath));
        }
        
        // API endpoint to run tests
        else if (parsedUrl.pathname.startsWith('/api/run/')) {
            const project = parsedUrl.pathname.split('/api/run/')[1];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: `Running ${project} tests...`,
                project: project,
                timestamp: new Date().toISOString()
            }));
            
            // Actually run the tests in background with correct command format
            const command = process.platform === 'win32' 
                ? `$env:PLAYWRIGHT_PROJECT="${project}"; npx playwright test tests/${project}/`
                : `PLAYWRIGHT_PROJECT="${project}" npx playwright test tests/${project}/`;
            
            exec(command, 
                (error, stdout, stderr) => {
                    console.log(`\n📊 ${project.toUpperCase()} Test Results:`);
                    console.log(stdout);
                    if (stderr) console.error(stderr);
                });
        }
        
        // API endpoint to get results
        else if (parsedUrl.pathname === '/api/results') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                lastUpdated: new Date().toISOString(),
                milkymist: { status: 'ready', lastRun: null },
                pernord: { status: 'ready', lastRun: null }
            }));
        }
        
        // Serve static files
        else {
            const filePath = path.join(__dirname, parsedUrl.pathname);
            if (fs.existsSync(filePath)) {
                res.writeHead(200);
                res.end(fs.readFileSync(filePath));
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        }
    });
    
    server.listen(8080, () => {
        console.log('\n🌐 Dashboard server running at: http://localhost:8080');
    });
}