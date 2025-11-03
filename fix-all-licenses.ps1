# Fix ALL licenses by adding application data to them
$envFile = "C:\Users\Adii\Desktop\Auth Hosted\Web-main\.env"
$token = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_TOKEN' } | ForEach-Object { $_.Split('=')[1].Trim() }
$user = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_USER' } | ForEach-Object { $_.Split('=')[1].Trim() }
$repo = Get-Content $envFile | Where-Object { $_ -match 'GITHUB_REPO' } | ForEach-Object { $_.Split('=')[1].Trim() }

Write-Host "Fixing ALL licenses in License.json..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/vnd.github.v3+json'
}

try {
    # Get user.json to map applicationIds to API keys
    $userResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$user/$repo/contents/user.json" -Headers $headers
    $userContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($userResponse.content))
    $userData = $userContent | ConvertFrom-Json
    
    Write-Host "Found $($userData.applications.Count) applications" -ForegroundColor Green
    
    # Get License.json
    $licenseResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$user/$repo/contents/License.json" -Headers $headers
    $licenseContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($licenseResponse.content))
    $licenseData = $licenseContent | ConvertFrom-Json
    
    Write-Host "Found $($licenseData.licenses.Count) license(s)" -ForegroundColor Green
    Write-Host ""
    
    # Fix each license
    $fixed = 0
    foreach ($license in $licenseData.licenses) {
        # Find matching application
        $app = $userData.applications | Where-Object { $_.id -eq $license.applicationId }
        
        if ($app) {
            Write-Host "Fixing license: $($license.licenseKey)" -ForegroundColor Yellow
            Write-Host "  App: $($app.name)" -ForegroundColor Gray
            Write-Host "  API Key: $($app.apiKey)" -ForegroundColor Gray
            
            # Add or update applicationData
            $license | Add-Member -NotePropertyName "applicationData" -NotePropertyValue @{
                name = $app.name
                apiKey = $app.apiKey
                version = $app.version
                isActive = $app.isActive
            } -Force
            
            $fixed++
        } else {
            Write-Host "WARNING: No application found for license $($license.licenseKey) (appId: $($license.applicationId))" -ForegroundColor Red
        }
    }
    
    if ($fixed -gt 0) {
        $licenseData.metadata.lastUpdated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        # Upload back to GitHub
        $newContent = $licenseData | ConvertTo-Json -Depth 10
        $encodedContent = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($newContent))
        
        $updateBody = @{
            message = "Add application data to all licenses"
            content = $encodedContent
            sha = $licenseResponse.sha
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "https://api.github.com/repos/$user/$repo/contents/License.json" `
            -Method PUT `
            -Headers $headers `
            -Body $updateBody | Out-Null
        
        Write-Host ""
        Write-Host "SUCCESS! Fixed $fixed license(s) in GitHub" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "IMPORTANT: RESTART YOUR SERVER NOW!" -ForegroundColor Red -BackgroundColor Yellow
    Write-Host "1. Go to terminal with npm run dev" -ForegroundColor White
    Write-Host "2. Press Ctrl+C" -ForegroundColor White
    Write-Host "3. Run: npm run dev" -ForegroundColor White
    Write-Host "4. Test again" -ForegroundColor White
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

