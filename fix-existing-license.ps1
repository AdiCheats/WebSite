# Fix existing license by adding application data to it
$envFile = "C:\Users\Adii\Desktop\Auth Hosted\Web-main\.env"
$token = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_TOKEN' } | ForEach-Object { $_.Split('=')[1].Trim() }
$user = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_USER' } | ForEach-Object { $_.Split('=')[1].Trim() }
$repo = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_REPO' } | ForEach-Object { $_.Split('=')[1].Trim() }

Write-Host "Fixing existing license in License.json..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/vnd.github.v3+json'
}

try {
    # Get License.json
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$user/$repo/contents/License.json" -Headers $headers
    $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    $licenseData = $content | ConvertFrom-Json
    
    Write-Host "Current license:" -ForegroundColor Yellow
    $licenseData.licenses[0] | ConvertTo-Json -Depth 5
    
    # Add application data to the license
    $licenseData.licenses[0] | Add-Member -NotePropertyName "applicationData" -NotePropertyValue @{
        name = "Aimkill"
        apiKey = "xYfG1ebdjPavaPTE8keR-nPbN78G3Uge"
        version = "1.0"
        isActive = $true
    } -Force
    
    $licenseData.metadata.lastUpdated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    Write-Host ""
    Write-Host "Updated license:" -ForegroundColor Green
    $licenseData.licenses[0] | ConvertTo-Json -Depth 5
    
    # Upload back to GitHub
    $newContent = $licenseData | ConvertTo-Json -Depth 10
    $encodedContent = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($newContent))
    
    $updateBody = @{
        message = "Add application data to license"
        content = $encodedContent
        sha = $response.sha
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "https://api.github.com/repos/$user/$repo/contents/License.json" `
        -Method PUT `
        -Headers $headers `
        -Body $updateBody | Out-Null
    
    Write-Host ""
    Write-Host "SUCCESS! License updated in GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now:" -ForegroundColor Yellow
    Write-Host "1. Restart your server (Ctrl+C then npm run dev)" -ForegroundColor White
    Write-Host "2. Test again with test-local.ps1" -ForegroundColor White
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

