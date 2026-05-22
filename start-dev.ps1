# ============================================================
# ChemVerse Dev Environment Startup Script (PowerShell)
# ============================================================
# This script cleanly kills any existing Node processes
# and starts the dev environment with fresh ports
# ============================================================

Write-Host ""
Write-Host "[ChemVerse] 🚀 Starting Development Environment" -ForegroundColor Green
Write-Host ""

# Kill any existing Node processes
Write-Host "[ChemVerse] 🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Kill any process on port 3001 specifically
$portProcesses = netstat -ano | Select-String ":3001"
if ($portProcesses) {
  $pid = $portProcesses[0] -split '\s+' | Select-Object -Last 1
  if ($pid -match '^\d+$') {
    Write-Host "[ChemVerse] Killing process $pid on port 3001..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
}

# Start dev environment
Write-Host "[ChemVerse] ⚡ Starting both backend and frontend..." -ForegroundColor Green
Write-Host ""
npm run dev:all
