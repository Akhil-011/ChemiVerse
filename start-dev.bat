@echo off
REM ============================================================
REM ChemVerse Dev Environment Startup Script (Windows)
REM ============================================================
REM This script cleanly kills any existing Node processes
REM and starts the dev environment with fresh ports
REM ============================================================

echo.
echo [ChemVerse] 🚀 Starting Development Environment
echo.

REM Kill any existing Node processes
echo [ChemVerse] 🧹 Cleaning up existing processes...
taskkill /F /IM node.exe /T 2>nul
timeout /T 2 /nobreak >nul

REM Start dev environment
echo [ChemVerse] ⚡ Starting both backend and frontend...
echo.
npm run dev:all

pause
