# Complete server restart script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Server Restart & Verification Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\Adii\Desktop\Auth Hosted\Web-main"

Write-Host "Step 1: Stopping any running servers..." -ForegroundColor Yellow

# Kill any node processes running on port 5000
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "  Killing process $pid..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host "OK: Port 5000 is now free" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Starting server..." -ForegroundColor Yellow
Write-Host "Opening new terminal window..." -ForegroundColor Gray

# Start server in a new window
$command = "cd '$projectPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $command

Write-Host "Waiting for server to start (10 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Step 3: Verifying server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 5
    Write-Host "OK: Server is running!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Server is NOT responding!" -ForegroundColor Red
    Write-Host "Please check the new terminal window for errors" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 4: Testing license validation..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"
}

$body = @{
    licenseKey = "AimkillTest-QKMC52-6GFOZH-VR8HZ9"
    hwid = "test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/v1/license/validate" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "SUCCESS! License validation working!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "FAILED! Still getting error" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response: $errorBody" -ForegroundColor Red
    } catch {}
    
    Write-Host ""
    Write-Host "Check the server terminal window for logs!" -ForegroundColor Yellow
    Write-Host "Look for these messages:" -ForegroundColor Yellow
    Write-Host "  - 'Skipping auth for public path: /api/v1/license/validate'" -ForegroundColor White
    Write-Host "  - '=== License Validation Request ==='" -ForegroundColor White
    Write-Host ""
    Write-Host "If you don't see those, the server is running OLD code!" -ForegroundColor Red
}

