# Clear server cache and test
Write-Host "Step 1: Clearing server cache..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri "http://localhost:5000/api/v1/license/clear-cache" `
        -Method POST `
        -UseBasicParsing | Out-Null
    Write-Host "OK: Cache cleared" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not clear cache (server might not be updated yet)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Testing license validation..." -ForegroundColor Cyan
Write-Host ""

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
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $statusCode" -ForegroundColor Red
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Gray
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody
    } catch {
        Write-Host $_.Exception.Message
    }
    
    Write-Host ""
    Write-Host "CHECK SERVER CONSOLE for debug logs!" -ForegroundColor Yellow
}

