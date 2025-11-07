# PowerShell script to find Node.js and start the dev server
# This script will find Node.js even if it's not in PATH

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to find Node.js in common locations
$nodePaths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:ProgramFiles(x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe"
)

$nodeExe = $null

# Check if node is in PATH
try {
    $nodeExe = (Get-Command node -ErrorAction Stop).Source
    Write-Host "Found Node.js in PATH: $nodeExe" -ForegroundColor Green
} catch {
    Write-Host "Node.js not in PATH, searching common locations..." -ForegroundColor Yellow
    
    foreach ($path in $nodePaths) {
        if (Test-Path $path) {
            $nodeExe = $path
            Write-Host "Found Node.js at: $nodeExe" -ForegroundColor Green
            break
        }
    }
}

if (-not $nodeExe) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Or add Node.js to your PATH environment variable." -ForegroundColor Yellow
    pause
    exit 1
}

# Get npm path (usually in same directory as node)
$nodeDir = Split-Path $nodeExe
$npmExe = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $npmExe)) {
    Write-Host "ERROR: npm not found!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Node.js version:" -ForegroundColor Cyan
& $nodeExe --version

Write-Host ""
Write-Host "Starting dev server on http://localhost:3000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Once you see 'Ready', click the Browser tab in Cursor!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to project directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

# Check for pnpm-lock.yaml
if (Test-Path "pnpm-lock.yaml") {
    $pnpmExe = Join-Path $nodeDir "pnpm.cmd"
    if (Test-Path $pnpmExe) {
        Write-Host "Using pnpm..." -ForegroundColor Cyan
        & $pnpmExe run dev
    } else {
        Write-Host "pnpm-lock.yaml found but pnpm not available, using npm..." -ForegroundColor Yellow
        & $npmExe run dev
    }
} else {
    Write-Host "Using npm..." -ForegroundColor Cyan
    & $npmExe run dev
}

