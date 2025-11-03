# Start Server Script
# This script starts the authentication server

Write-Host "🚀 Starting Authentication Server..." -ForegroundColor Green
Write-Host ""

# Navigate to server directory
$serverPath = "C:\Users\Adii\Desktop\Auth Hosted\Web-main"
Set-Location $serverPath

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✓ Found package.json" -ForegroundColor Green
    Write-Host "📍 Server directory: $serverPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the server
    Write-Host "Starting npm dev server..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "❌ Error: package.json not found in $serverPath" -ForegroundColor Red
    Write-Host "Please check the server path." -ForegroundColor Yellow
    exit 1
}

