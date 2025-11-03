# Test both licenses
Write-Host "Testing Both Licenses..." -ForegroundColor Cyan
Write-Host ""

# Test 1: AimkillTest
Write-Host "Test 1: AimkillTest License" -ForegroundColor Yellow
$headers1 = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"
}
$body1 = '{"licenseKey":"AimkillTest-QKMC52-6GFOZH-VR8HZ9","hwid":"test"}'

try {
    $r1 = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/license/validate" `
        -Method POST -Headers $headers1 -Body $body1
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "  License: $($r1.license.licenseKey)" -ForegroundColor Gray
    Write-Host "  App: $($r1.license.applicationData.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Aimkill
Write-Host "Test 2: Aimkill License" -ForegroundColor Yellow
$headers2 = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "xYfG1ebdjPavaPTE8keR-nPbN78G3Uge"
}
$body2 = '{"licenseKey":"Aimkill-PY5WP0-Y8Z5TZ-TBHGCR","hwid":"test"}'

try {
    $r2 = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/license/validate" `
        -Method POST -Headers $headers2 -Body $body2
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "  License: $($r2.license.licenseKey)" -ForegroundColor Gray
    Write-Host "  App: $($r2.license.applicationData.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "ALL TESTS COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

