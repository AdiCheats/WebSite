# Restart Server Script
# Kills any process on port 5000 and starts the server fresh

$port = 5000
$serverPath = "C:\Users\Adii\Desktop\Auth Hosted\Web-main"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Server Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for processes using port 5000
Write-Host "🔍 Checking for processes using port $port..." -ForegroundColor Yellow
$processes = netstat -ano | findstr ":$port" | findstr "LISTENING"

if ($processes) {
    Write-Host "⚠️  Found process using port $port" -ForegroundColor Yellow
    
    # Extract PID from netstat output
    $pid = ($processes | Select-Object -First 1) -replace '\s+', ' ' | ForEach-Object { ($_ -split ' ')[-1] }
    
    if ($pid -and $pid -ne '0') {
        Write-Host "🛑 Killing process PID: $pid" -ForegroundColor Red
        taskkill /F /PID $pid 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Process killed successfully" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } else {
            Write-Host "⚠️  Could not kill process. It may have already stopped." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✓ Port $port is free" -ForegroundColor Green
}

Write-Host ""

# Navigate to server directory
Set-Location $serverPath

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host ""
    
    # Start the server
    npm run dev
} else {
    Write-Host "❌ Error: package.json not found in $serverPath" -ForegroundColor Red
    exit 1
}
