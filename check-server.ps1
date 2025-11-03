# Check if server is running and configured correctly
Write-Host "Checking Server Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = "C:\Users\Adii\Desktop\Auth Hosted\Web-main\.env"
if (Test-Path $envPath) {
    Write-Host "OK: .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content $envPath
    $hasToken = $envContent | Where-Object { $_ -match 'GITHUB_TOKEN' }
    $hasUser = $envContent | Where-Object { $_ -match 'GITHUB_USER' }
    $hasRepo = $envContent | Where-Object { $_ -match 'GITHUB_REPO' }
    
    if ($hasToken) { Write-Host "OK: GITHUB_TOKEN set" -ForegroundColor Green }
    if ($hasUser) { Write-Host "OK: GITHUB_USER set" -ForegroundColor Green }
    if ($hasRepo) { Write-Host "OK: GITHUB_REPO set" -ForegroundColor Green }
} else {
    Write-Host "ERROR: .env file NOT found" -ForegroundColor Red
}

Write-Host ""

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "OK: Server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Server is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Start server:" -ForegroundColor Yellow
    Write-Host '  cd "C:\Users\Adii\Desktop\Auth Hosted\Web-main"' -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
}
