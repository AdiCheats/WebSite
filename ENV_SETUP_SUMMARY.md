# Environment Setup - Quick Fix

## The Problem
Your application shows "GitHub API error: 401 - Bad credentials" because the `.env` file with your GitHub token doesn't exist.

## The Solution (3 Steps)

### Step 1: Create .env File
Create a file named `.env` in your project root: `C:\Users\Adii\Desktop\Auth Hosted\Web-main\.env`

### Step 2: Add Configuration
Copy this into your `.env` file and replace `your_github_token_here`:

```env
GITHUB_TOKEN=your_github_token_here
GITHUB_USER=AdiCheats
GITHUB_REPO=AimkillAuth
DATA_FILE=user.json
SESSION_SECRET=adi_cheats_secret_key_12345_change_this
ADMIN_PANEL_KEY=ADI_ADMIN_KEY-r9#T7!qZ2@xP8^mL4%wV0&uN6*sF1+Yb3$Kj5~GhQz
PORT=5000
NODE_ENV=development
```

### Step 3: Get GitHub Token

#### Option A: Using GitHub Web Interface (Recommended)
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `AdiCheats Auth System`
4. Expiration: Choose your preference (or "No expiration")
5. ✅ Check **repo** (Full control of private repositories)
6. Click "Generate token"
7. **COPY THE TOKEN** (starts with `ghp_`)
8. Paste it in your `.env` file

#### Option B: GitHub CLI (if installed)
```bash
gh auth login
```

### Step 4: Restart Server
Stop your current server (Ctrl+C) and restart:
```bash
npm run dev
```

## Verification

### ✅ Success Looks Like:
```
✓ GitHub configuration loaded successfully
  Repository: AdiCheats/AimkillAuth
  Data File: user.json
  Token: ghp_xxxx...xxxx
```

### ❌ Failure Looks Like:
```
❌ CRITICAL: Missing GitHub configuration in .env file!
GITHUB_TOKEN: ✗ MISSING
```

## Troubleshooting

### "Bad credentials" (401 error)
- Your token is invalid or doesn't exist
- Make sure you copied the entire token
- Token should start with `ghp_`

### "Repository not found" (404 error)
- Create the repository at: https://github.com/new
- Name it `AimkillAuth`
- Make it private (recommended)

### File still not loading
1. Check file location: `.env` must be in the root directory
2. Check file name: Must be exactly `.env` (not `.env.txt`)
3. No spaces around `=` signs
4. No quotes around values

## Security Notes
- ✅ `.env` is already in `.gitignore` - won't be committed
- ❌ NEVER share your GitHub token
- ❌ NEVER commit `.env` to Git
- 🔄 If token is exposed, delete it from GitHub and create a new one

## Quick Test
After setup, you should be able to:
1. See the dashboard without errors
2. Create applications
3. Create users
4. Everything will be stored in your GitHub repository

## Need Help?
Check `GITHUB_SETUP_GUIDE.md` for detailed instructions with screenshots and explanations.

