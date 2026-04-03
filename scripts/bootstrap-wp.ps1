#!/usr/bin/env pwsh
<#
.SYNOPSIS
    WP-Lzer Quick Start Bootstrap Script
.DESCRIPTION
    Initializes the local development environment for the headless WooCommerce project
#>

$ErrorActionPreference = "Stop"

Write-Host "WP-Lzer Bootstrap" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$prereqChecks = @(
    @{ name = "Docker"; cmd = "docker --version" }
    @{ name = "Node.js"; cmd = "node --version" }
    @{ name = "npm"; cmd = "npm --version" }
)

foreach ($check in $prereqChecks) {
    try {
        $result = Invoke-Expression $check.cmd 2>&1
        Write-Host "  [OK] $($check.name): $result" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $($check.name) not found" -ForegroundColor Red
        Write-Host "  Please install $($check.name) before continuing" -ForegroundColor Yellow
    }
}

Write-Host ""

# Copy environment files
Write-Host "Setting up environment files..." -ForegroundColor Yellow

$envFiles = @(
    @{ src = "$ProjectRoot\docker\.env.example"; dest = "$ProjectRoot\docker\.env" }
    @{ src = "$ProjectRoot\frontend\.env.local.example"; dest = "$ProjectRoot\frontend\.env.local" }
)

foreach ($file in $envFiles) {
    if (-not (Test-Path $file.dest)) {
        Copy-Item $file.src $file.dest -Force
        Write-Host "  Created: $($file.dest)" -ForegroundColor Green
    } else {
        Write-Host "  Skipped (exists): $($file.dest)" -ForegroundColor Gray
    }
}

Write-Host ""

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\docker"
try {
    docker-compose up -d
    Write-Host "  [OK] Containers started" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Could not start containers" -ForegroundColor Red
    Write-Host "  Make sure Docker Desktop is running" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\frontend"
try {
    npm install
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] npm install failed" -ForegroundColor Red
}
Pop-Location

Write-Host ""
Write-Host "Bootstrap complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit docker\.env with your settings"
Write-Host "  2. Run: cd docker; docker-compose up -d"
Write-Host "  3. Install WordPress plugins via WP Admin"
Write-Host "  4. Run: cd frontend; npm run dev"
