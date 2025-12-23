# fix-imports.ps1 - Fixed Import Path Updater
Write-Host "Starting import path fixes..." -ForegroundColor Green

$directories = @("tests/MilkyMist", "tests/Pernord", "playwrightMCP/tests")

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "Processing directory: $dir" -ForegroundColor Yellow
        $files = Get-ChildItem -Path $dir -Filter "*.spec.ts" -Recurse
        
        foreach ($file in $files) {
            Write-Host "  Fixing: $($file.Name)" -ForegroundColor Cyan
            $content = Get-Content $file.FullName -Raw
            
            # Replace import paths
            # Fix pages imports
            $content = $content -replace "from\s+['`"]\.\./\.\./pages/", "from '@pages/"
            $content = $content -replace "from\s+['`"]\.\./\.\./\.\./\.\./pages/", "from '@pages/"
            
            # Fix testData imports  
            $content = $content -replace "from\s+['`"]\.\./\.\./testData/", "from '@testData/"
            $content = $content -replace "from\s+['`"]\.\./\.\./\.\./\.\./testData/", "from '@testData/"
            $content = $content -replace "from\s+['`"]\.\./\.\./\.\./testData/", "from '@testData/"
            
            # Fix Database imports
            $content = $content -replace "from\s+['`"]\.\./\.\./Database/", "from '@database/"
            $content = $content -replace "from\s+['`"]\.\./\.\./\.\./\.\./Database/", "from '@database/"
            
            # Fix utils imports
            $content = $content -replace "from\s+['`"]\.\./\.\./utils/", "from '@utils/"
            
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        }
    } else {
        Write-Host "Directory not found: $dir" -ForegroundColor Red
    }
}

Write-Host "`nImport paths updated successfully!" -ForegroundColor Green
Write-Host "Files updated in:" -ForegroundColor Yellow
$directories | ForEach-Object { Write-Host "  $_" }