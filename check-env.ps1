# PowerShell script to check .env configuration
# Run this with: .\check-env.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ADI CHEATS - Environment Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env"
$rootDir = $PSScriptRoot

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file NOT FOUND!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env template..." -ForegroundColor Yellow
    
    $template = @"
GITHUB_TOKEN=your_github_token_here
GITHUB_USER=AdiCheats
GITHUB_REPO=AimkillAuth
DATA_FILE=user.json
SESSION_SECRET=adi_cheats_secret_key_12345_change_this
ADMIN_PANEL_KEY=ADI_ADMIN_KEY-r9#T7!qZ2@xP8^mL4%wV0&uN6*sF1+Yb3$Kj5~GhQz
PORT=5000
NODE_ENV=development
"@
    
    Set-Content -Path $envFile -Value $template
    Write-Host "✓ Created .env template file" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 TODO:" -ForegroundColor Yellow
    Write-Host "1. Open .env file" -ForegroundColor White
    Write-Host "2. Replace 'your_github_token_here' with your actual token" -ForegroundColor White
    Write-Host "3. Get a token from: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host "✓ .env file found!" -ForegroundColor Green
Write-Host ""

# Read and parse .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# Check required variables
$required = @("GITHUB_TOKEN", "GITHUB_USER", "GITHUB_REPO", "DATA_FILE")
$missing = @()
$hasPlaceholder = $false

Write-Host "Checking required variables:" -ForegroundColor Cyan
Write-Host ""

foreach ($key in $required) {
    if ($envVars.ContainsKey($key) -and $envVars[$key]) {
        $value = $envVars[$key]
        
        # Check if it's a placeholder
        if ($value -like "*your_*_here*" -or $value -eq "your_github_token_here") {
            Write-Host "  ⚠️  $key : $value" -ForegroundColor Yellow
            Write-Host "      ^ This is a placeholder! Replace it with actual value." -ForegroundColor Yellow
            $hasPlaceholder = $true
        }
        # Mask the token for security
        elseif ($key -eq "GITHUB_TOKEN") {
            $masked = $value.Substring(0, [Math]::Min(8, $value.Length)) + "..." + $value.Substring([Math]::Max(0, $value.Length - 4))
            Write-Host "  ✓  $key : $masked" -ForegroundColor Green
        }
        else {
            Write-Host "  ✓  $key : $value" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  ❌  $key : MISSING" -ForegroundColor Red
        $missing += $key
    }
}

Write-Host ""

if ($missing.Count -gt 0 -or $hasPlaceholder) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ACTION REQUIRED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    if ($missing.Count -gt 0) {
        Write-Host "Missing variables: $($missing -join ', ')" -ForegroundColor Red
        Write-Host ""
    }
    
    if ($hasPlaceholder) {
        Write-Host "📝 Steps to fix:" -ForegroundColor Yellow
        Write-Host "1. Go to https://github.com/settings/tokens" -ForegroundColor White
        Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor White
        Write-Host "3. Select 'repo' scope" -ForegroundColor White
        Write-Host "4. Copy the token (starts with ghp_)" -ForegroundColor White
        Write-Host "5. Replace 'your_github_token_here' in .env file" -ForegroundColor White
    }
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Configuration looks good!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your GitHub configuration:" -ForegroundColor Cyan
    Write-Host "  Repository: $($envVars['GITHUB_USER'])/$($envVars['GITHUB_REPO'])" -ForegroundColor White
    Write-Host "  Data File: $($envVars['DATA_FILE'])" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Make sure repository exists at: https://github.com/$($envVars['GITHUB_USER'])/$($envVars['GITHUB_REPO'])" -ForegroundColor White
    Write-Host "2. Start/restart your server with: npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "For detailed setup guide, see: GITHUB_SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host ""

