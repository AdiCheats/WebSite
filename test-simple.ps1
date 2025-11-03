# Very simple test
Write-Host "Testing /api/v1/license/validate..." -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"
}

$body = '{"licenseKey":"AimkillTest-QKMC52-6GFOZH-VR8HZ9","hwid":"test"}'

Write-Host "Request:"
Write-Host "  URL: http://localhost:5000/api/v1/license/validate"
Write-Host "  API Key: 80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"
Write-Host "  License: AimkillTest-QKMC52-6GFOZH-VR8HZ9"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/license/validate" `
        -Method POST `
        -Headers $headers `
        -Body $body
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $_"
}

