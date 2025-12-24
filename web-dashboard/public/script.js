// web-dashboard/public/script.js
class PlaywrightDashboard {
    constructor() {
        this.currentProject = 'milkymist';
        this.currentModule = 'all';
        this.testFiles = [];
        this.modules = ['all'];
        this.isRunning = false;
        this.projects = {};
        this.selectedTestFile = null;
        
        this.init();
    }
    
    async init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        await this.loadProjects();
        await this.loadModules();
        await this.loadTestFiles();
        this.loadExecutions();
        this.setupEventListeners();
        this.startConnectionCheck();
    }
    
    updateTime() {
        const now = new Date();
        document.getElementById('last-updated').textContent = 
            now.toLocaleTimeString();
    }
    
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            this.projects = data;
            
            this.updateProjectInfo();
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }
    
    async loadModules() {
        try {
            const response = await fetch(`/api/project-modules?project=${this.currentProject}`);
            const data = await response.json();
            
            if (data.success) {
                this.modules = data.modules;
                this.renderModuleSidebar();
            }
        } catch (error) {
            console.error('Failed to load modules:', error);
        }
    }
    
    renderModuleSidebar() {
        const moduleList = document.getElementById('module-list');
        if (!moduleList) return;
        
        moduleList.innerHTML = this.modules.map(module => `
            <div class="module-item ${module === 'all' ? 'active' : ''}" 
                 data-module="${module}" 
                 onclick="dashboard.selectModule('${module}')">
                <i class="fas ${this.getModuleIcon(module)}"></i>
                <span>${module.charAt(0).toUpperCase() + module.slice(1)}</span>
            </div>
        `).join('');
    }
    
    getModuleIcon(module) {
        const icons = {
            'all': 'fa-play',
            'login': 'fa-sign-in-alt',
            'changepassword': 'fa-key',
            'master': 'fa-database',
            'inventory': 'fa-boxes',
            'receiving': 'fa-truck-loading',
            'shipping': 'fa-shipping-fast',
            'general': 'fa-cogs'
        };
        return icons[module] || 'fa-folder';
    }
    
    selectModule(module) {
        this.currentModule = module;
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-module="${module}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        document.getElementById('current-module').textContent = 
            module.charAt(0).toUpperCase() + module.slice(1);
        
        this.loadTestFiles();
    }
    
    updateProjectInfo() {
        const project = this.projects[this.currentProject];
        if (!project) return;
        
        document.getElementById('info-baseurl').textContent = project.baseURL;
        document.getElementById('info-username').textContent = project.credentials.username;
        document.getElementById('info-database').textContent = 
            project.database ? `${project.database.database} (${project.database.server})` : 'Not configured';
        
        document.getElementById('current-project').textContent = project.name;
    }
    
    async loadTestFiles() {
        try {
            const container = document.getElementById('test-files');
            container.innerHTML = '<div class="loading">Loading test files...</div>';
            
            const response = await fetch(`/api/test-files?project=${this.currentProject}&module=${this.currentModule}`);
            const data = await response.json();
            
            if (data.success) {
                this.testFiles = data.files;
                this.renderTestFiles();
            } else {
                container.innerHTML = `<div class="loading">${data.error || 'No test files found'}</div>`;
            }
        } catch (error) {
            document.getElementById('test-files').innerHTML = 
                '<div class="loading">Failed to load test files</div>';
        }
    }
    
    renderTestFiles() {
        const container = document.getElementById('test-files');
        
        if (!this.testFiles || this.testFiles.length === 0) {
            container.innerHTML = '<div class="loading">No test files found</div>';
            return;
        }
        
        container.innerHTML = this.testFiles.map(file => `
            <div class="test-file" onclick="dashboard.openExecutionPopup('${file.path}', '${file.name}')">
                <div class="test-file-header">
                    <div class="test-file-name">${file.name.replace('.spec.ts', '').replace('.spec.js', '')}</div>
                    <div class="test-file-module">${file.module}</div>
                </div>
                <div class="test-file-path">${file.path}</div>
                <div class="test-file-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); dashboard.quickRunTest('${file.path}')" title="Quick Run">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    openExecutionPopup(testPath, testName) {
        this.selectedTestFile = testPath;
        
        const popup = document.createElement('div');
        popup.className = 'execution-popup-overlay';
        popup.innerHTML = `
            <div class="execution-popup">
                <div class="popup-header">
                    <h3>Execute Test: ${testName}</h3>
                    <button class="btn-icon close-popup" onclick="this.closest('.execution-popup-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="popup-body">
                    <div class="execution-options">
                        <h4>Execution Options</h4>
                        <div class="option-group">
                            <label class="option-checkbox">
                                <input type="checkbox" id="option-headed">
                                <span class="checkmark"></span>
                                <span class="option-label">
                                    <i class="fas fa-desktop"></i>
                                    <span>Headed Mode</span>
                                </span>
                            </label>
                            
                            <label class="option-checkbox">
                                <input type="checkbox" id="option-debug">
                                <span class="checkmark"></span>
                                <span class="option-label">
                                    <i class="fas fa-bug"></i>
                                    <span>Debug Mode</span>
                                </span>
                            </label>
                            
                            <label class="option-checkbox">
                                <input type="checkbox" id="option-ui">
                                <span class="checkmark"></span>
                                <span class="option-label">
                                    <i class="fas fa-sliders-h"></i>
                                    <span>Playwright UI</span>
                                </span>
                            </label>
                        </div>
                        
                        <div class="option-info">
                            <p><i class="fas fa-info-circle"></i> Select one or more execution options:</p>
                            <ul>
                                <li><strong>Headed Mode:</strong> Run tests with visible browser window</li>
                                <li><strong>Debug Mode:</strong> Run with debugger, opens browser dev tools</li>
                                <li><strong>Playwright UI:</strong> Use Playwright's interactive test runner UI</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="btn btn-outline" onclick="this.closest('.execution-popup-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="dashboard.executeWithOptions()">
                        <i class="fas fa-play"></i> Execute Test
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add styles if not already present
        if (!document.getElementById('popup-styles')) {
            const styles = document.createElement('style');
            styles.id = 'popup-styles';
            styles.textContent = `
                .execution-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                
                .execution-popup {
                    background: white;
                    border-radius: 12px;
                    width: 500px;
                    max-width: 90vw;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }
                
                .popup-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .popup-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                }
                
                .popup-body {
                    padding: 30px;
                }
                
                .execution-options h4 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #333;
                }
                
                .option-group {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .option-checkbox {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                
                .option-checkbox:hover {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                }
                
                .option-checkbox input {
                    display: none;
                }
                
                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    margin-right: 15px;
                    position: relative;
                    transition: all 0.3s;
                }
                
                .option-checkbox input:checked + .checkmark {
                    background: #667eea;
                    border-color: #667eea;
                }
                
                .option-checkbox input:checked + .checkmark:after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                }
                
                .option-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                    color: #333;
                }
                
                .option-label i {
                    color: #667eea;
                }
                
                .option-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }
                
                .option-info p {
                    margin-top: 0;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .option-info ul {
                    margin: 10px 0 0 20px;
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .option-info li {
                    margin-bottom: 5px;
                }
                
                .popup-footer {
                    padding: 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                .close-popup {
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 5px;
                }
                
                .test-file-actions {
                    margin-top: 10px;
                    display: flex;
                    gap: 5px;
                    justify-content: flex-end;
                }
                
                .test-file-actions .btn-icon {
                    background: rgba(102, 126, 234, 0.1);
                    border: none;
                    padding: 6px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #667eea;
                }
                
                .test-file-actions .btn-icon:hover {
                    background: rgba(102, 126, 234, 0.2);
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    executeWithOptions() {
        const options = {
            headed: document.getElementById('option-headed').checked,
            debug: document.getElementById('option-debug').checked,
            ui: document.getElementById('option-ui').checked
        };
        
        // Close popup
        document.querySelector('.execution-popup-overlay')?.remove();
        
        // Run test with options
        this.runSpecificTest(this.selectedTestFile, options);
    }
    
    quickRunTest(testPath) {
        event.stopPropagation();
        this.runSpecificTest(testPath, {});
    }
    
    filterTestFiles(searchTerm) {
        if (!searchTerm) {
            this.renderTestFiles();
            return;
        }
        
        const filtered = this.testFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.path.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const container = document.getElementById('test-files');
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="loading">No matching test files</div>';
            return;
        }
        
        container.innerHTML = filtered.map(file => `
            <div class="test-file" onclick="dashboard.openExecutionPopup('${file.path}', '${file.name}')">
                <div class="test-file-header">
                    <div class="test-file-name">${file.name.replace('.spec.ts', '').replace('.spec.js', '')}</div>
                    <div class="test-file-module">${file.module}</div>
                </div>
                <div class="test-file-path">${file.path}</div>
                <div class="test-file-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); dashboard.quickRunTest('${file.path}')" title="Quick Run">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadExecutions() {
        try {
            const response = await fetch('/api/executions');
            const data = await response.json();
            this.renderExecutions(data.logs);
        } catch (error) {
            console.error('Failed to load executions:', error);
        }
    }
    
    renderExecutions(logs) {
        const container = document.getElementById('recent-tests');
        
        if (!logs || logs.length === 0) {
            container.innerHTML = '<div class="recent-item">No recent tests</div>';
            return;
        }
        
        container.innerHTML = logs.slice(0, 5).map(log => `
            <div class="recent-item" onclick="dashboard.viewExecutionDetails('${log.id}')">
                <div class="recent-header">
                    <span class="recent-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="recent-status ${log.success ? 'status-passed' : 'status-failed'}">
                        ${log.success ? '✓' : '✗'}
                    </span>
                </div>
                <div class="recent-project">${log.project}</div>
                <div class="recent-file">${log.testFile.split('/').pop()}</div>
            </div>
        `).join('');
    }
    
    async viewExecutionDetails(executionId) {
        try {
            const response = await fetch(`/api/execution/${executionId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showExecutionDetailsPopup(data.log);
            }
        } catch (error) {
            console.error('Failed to load execution details:', error);
        }
    }
    
    showExecutionDetailsPopup(log) {
        const popup = document.createElement('div');
        popup.className = 'execution-popup-overlay';
        popup.innerHTML = `
            <div class="execution-popup" style="max-width: 800px; max-height: 80vh;">
                <div class="popup-header">
                    <h3>Execution Details</h3>
                    <button class="btn-icon close-popup" onclick="this.closest('.execution-popup-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="popup-body">
                    <div class="execution-info">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Project:</label>
                                <span>${log.project}</span>
                            </div>
                            <div class="info-item">
                                <label>Time:</label>
                                <span>${new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <label>Status:</label>
                                <span class="status-badge ${log.success ? 'status-passed' : 'status-failed'}">
                                    ${log.success ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                            <div class="info-item">
                                <label>Exit Code:</label>
                                <span>${log.exitCode}</span>
                            </div>
                        </div>
                        
                        <div class="execution-console">
                            <h4>Console Output</h4>
                            <div class="console-output-small">
                                ${log.output.split('\n').map(line => {
                                    if (line.includes('✓') || line.includes('passed')) {
                                        return `<div class="console-line success">${line}</div>`;
                                    } else if (line.includes('✗') || line.includes('failed') || line.includes('Error')) {
                                        return `<div class="console-line error">${line}</div>`;
                                    } else {
                                        return `<div class="console-line info">${line}</div>`;
                                    }
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="btn" onclick="this.closest('.execution-popup-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
    }
    
    async runTests() {
        if (this.isRunning) {
            this.showToast('Tests are already running!', 'warning');
            return;
        }
        
        this.isRunning = true;
        this.showLoading('Running tests...');
        
        const runBtn = document.getElementById('run-tests-btn');
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        runBtn.disabled = true;
        
        document.getElementById('execution-status').textContent = 'Running';
        document.getElementById('execution-status').className = 'status-badge status-running';
        
        this.logToConsole('info', `Starting ${this.currentProject} ${this.currentModule} tests...`);
        
        try {
            const response = await fetch('/api/run-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: this.currentProject,
                    module: this.currentModule
                })
            });
            
            const result = await response.json();
            
            this.handleExecutionResult(result);
            
        } catch (error) {
            this.logToConsole('error', `❌ Error: ${error.message}`);
            this.showToast('Failed to run tests!', 'error');
        } finally {
            this.isRunning = false;
            this.hideLoading();
            
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run Tests';
            runBtn.disabled = false;
            
            this.loadExecutions();
        }
    }
    
    async runSpecificTest(testPath, options = {}) {
        if (this.isRunning) {
            this.showToast('Tests are already running!', 'warning');
            return;
        }
        
        this.isRunning = true;
        this.showLoading(`Running test: ${testPath}`);
        
        this.logToConsole('info', `Running specific test: ${testPath}`);
        
        // Show execution options in console
        if (options.headed) {
            this.logToConsole('info', '📱 Mode: Headed (Visible Browser)');
        }
        if (options.debug) {
            this.logToConsole('info', '🐛 Mode: Debug (Dev Tools)');
        }
        if (options.ui) {
            this.logToConsole('info', '🎨 Mode: Playwright UI');
        }
        
        try {
            const response = await fetch('/api/run-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: this.currentProject,
                    testFile: testPath,
                    options: options
                })
            });
            
            const result = await response.json();
            
            this.handleExecutionResult(result);
            
        } catch (error) {
            this.logToConsole('error', `❌ Error: ${error.message}`);
            this.showToast('Failed to run test!', 'error');
        } finally {
            this.isRunning = false;
            this.hideLoading();
            this.loadExecutions();
        }
    }
    
    handleExecutionResult(result) {
        if (result.success) {
            this.logToConsole('success', '✅ Execution completed successfully!');
            document.getElementById('execution-status').className = 'status-badge status-passed';
            document.getElementById('execution-status').textContent = 'Passed';
            this.showToast('Execution completed successfully!', 'success');
        } else {
            this.logToConsole('error', '❌ Execution failed!');
            document.getElementById('execution-status').className = 'status-badge status-failed';
            document.getElementById('execution-status').textContent = 'Failed';
            this.showToast('Execution failed! Check console for details.', 'error');
        }
        
        // Output results
        if (result.output) {
            const lines = result.output.split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    if (line.includes('✓') || line.includes('passed')) {
                        this.logToConsole('success', line);
                    } else if (line.includes('✗') || line.includes('failed') || line.includes('Error')) {
                        this.logToConsole('error', line);
                    } else if (line.includes('warning') || line.includes('Warning')) {
                        this.logToConsole('warning', line);
                    } else {
                        this.logToConsole('info', line);
                    }
                }
            });
        }
        
        if (result.stderr) {
            this.logToConsole('error', result.stderr);
        }
    }
    
    async runTestFile(type) {
        if (type === 'login') {
            this.currentModule = 'login';
            await this.runTests();
        } else if (type === 'changepassword') {
            this.currentModule = 'changepassword';
            await this.runTests();
        }
    }
    
    async runDebugMode() {
        this.showToast('Opening debug mode...', 'info');
        this.logToConsole('info', '🔧 Starting debug mode...');
        
        // Open debug mode with default test
        const testFile = `tests/${this.currentProject}/login/login.spec.ts`;
        this.runSpecificTest(testFile, { debug: true });
    }
    
    logToConsole(type, message) {
        const consoleEl = document.getElementById('console-output');
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = message;
        consoleEl.appendChild(line);
        
        // Scroll to bottom
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
    
    clearConsole() {
        document.getElementById('console-output').innerHTML = `
            <div class="console-line info">🎭 Playwright Web Dashboard v2.0</div>
            <div class="console-line info">📍 Console cleared</div>
            <div class="console-line divider">────────────────────────────────────────────────────────────</div>
        `;
    }
    
    copyConsoleOutput() {
        const text = document.getElementById('console-output').textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Console output copied to clipboard!', 'success');
        });
    }
    
    downloadConsoleOutput() {
        const text = document.getElementById('console-output').textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `playwright-console-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async openReport() {
        try {
            await fetch('/api/open-report');
            this.showToast('Opening HTML report...', 'info');
        } catch (error) {
            this.showToast('Failed to open report', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        document.getElementById('loading-message').textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'none';
    }
    
    setupEventListeners() {
        // Project selection
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.currentProject = item.dataset.project;
                document.getElementById('current-project').textContent = 
                    item.querySelector('span').textContent;
                
                this.updateProjectInfo();
                this.loadModules();
                this.loadTestFiles();
            });
        });
        
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTestFiles(e.target.value);
            });
        }
    }
    
    startConnectionCheck() {
        setInterval(async () => {
            try {
                await fetch('/api/ping');
                document.getElementById('connection-status').textContent = 'Connected';
                document.getElementById('connection-status').style.color = '#3fb950';
            } catch (error) {
                document.getElementById('connection-status').textContent = 'Disconnected';
                document.getElementById('connection-status').style.color = '#f85149';
            }
        }, 5000);
    }
    
    async refreshDashboard() {
        await this.loadProjects();
        await this.loadModules();
        await this.loadTestFiles();
        this.showToast('Dashboard refreshed!', 'success');
    }
}

// Initialize dashboard when page loads
let dashboard;
window.addEventListener('DOMContentLoaded', () => {
    dashboard = new PlaywrightDashboard();
    window.dashboard = dashboard;
});

// Global functions for HTML onclick handlers
function runTests() {
    dashboard.runTests();
}

function runTestFile(type) {
    dashboard.runTestFile(type);
}

function runSpecificTest(path) {
    dashboard.runSpecificTest(path);
}

function runDebugMode() {
    dashboard.runDebugMode();
}

function openReport() {
    dashboard.openReport();
}

function clearConsole() {
    dashboard.clearConsole();
}

function loadTestFiles() {
    dashboard.loadTestFiles();
}

function filterTestFiles() {
    const searchTerm = document.getElementById('search-input').value;
    dashboard.filterTestFiles(searchTerm);
}

function refreshDashboard() {
    dashboard.refreshDashboard();
}