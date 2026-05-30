@echo off
REM ========================================
REM Second Auto Gear - Local Dev Setup Script
REM ========================================
REM This script sets up the project for local development

setlocal enabledelayedexpansion

echo.
echo ================================================
echo Second Auto Gear - Local Development Setup
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if PostgreSQL is available
echo.
echo Checking for PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ℹ️  PostgreSQL not found in PATH
    echo You can either:
    echo   1. Install PostgreSQL from https://www.postgresql.org/download/windows/
    echo   2. Use Docker: docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=second_auto_gear_dev -p 5432:5432 -d postgres:15
) else (
    echo ✅ PostgreSQL found
    psql --version
)

REM Setup backend
echo.
echo ================================================
echo Setting up Backend...
echo ================================================
cd server

if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)

if not exist .env.local (
    echo.
    echo Creating .env.local from template...
    copy .env.local.example .env.local
    echo.
    echo ⚠️  Please edit server\.env.local with your database credentials:
    echo   - DB_HOST=localhost
    echo   - DB_PASSWORD=your_password
    echo   - MOCK_PAYMENTS=true
    pause
)

cd ..

REM Setup frontend
echo.
echo ================================================
echo Setting up Frontend...
echo ================================================
cd frontend

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)

if not exist .env.local (
    echo.
    echo Creating frontend .env.local...
    (
        echo VITE_API_URL=http://localhost:3000
    ) > .env.local
    echo ✅ Frontend .env.local created
)

cd ..

echo.
echo ================================================
echo ✅ Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd server
echo    npm run dev
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:5173
echo.
echo Database Setup (if needed):
echo   - PostgreSQL: Create database "second_auto_gear_dev"
echo   - Docker: docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=second_auto_gear_dev -p 5432:5432 -d postgres:15
echo.
echo For local development:
echo   - Mock payments are enabled by default
echo   - You don't need access to real payment gateways
echo   - Check server\.env.local for configuration
echo.
echo See LOCAL_DEVELOPMENT_GUIDE.md for detailed instructions.
echo.

pause
