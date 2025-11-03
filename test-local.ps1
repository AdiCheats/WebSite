# Test local server
Write-Host "Testing Local License Validation..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"
}

$body = @{
    licenseKey = "AimkillTest-QKMC52-6GFOZH-VR8HZ9"
    hwid = "test"
} | ConvertTo-Json

Write-Host "Endpoint: http://localhost:5000/api/v1/license/validate" -ForegroundColor Yellow
Write-Host "API Key: 80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6" -ForegroundColor Yellow
Write-Host "License: AimkillTest-QKMC52-6GFOZH-VR8HZ9" -ForegroundColor Yellow
Write-Host ""

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
    
    if ($statusCode -eq 401) {
        Write-Host "ERROR: API Key Invalid" -ForegroundColor Red
    } elseif ($statusCode -eq 400) {
        Write-Host "ERROR: License validation failed" -ForegroundColor Yellow
    }
    
    Write-Host "Response:" -ForegroundColor Gray
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody
    } catch {
        Write-Host $_.Exception.Message
    }
}

