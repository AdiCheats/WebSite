# GitHub Setup Guide

## Problem
The application shows no data because it cannot connect to GitHub to store/retrieve your authentication data.

## Solution: Create GitHub Personal Access Token

### Step 1: Create a GitHub Repository (if not already created)
1. Go to https://github.com/new
2. Repository name: `AimkillAuth` (or any name you prefer)
3. Make it **Private** (recommended for security)
4. Click "Create repository"

### Step 2: Create a Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `AdiCheats Auth System`
4. Select expiration: "No expiration" or your preferred duration
5. Select scopes:
   - ✅ **repo** (Full control of private repositories) - This is required!
   - That's all you need
6. Click "Generate token" at the bottom
7. **IMPORTANT:** Copy the token immediately! You won't be able to see it again.

### Step 3: Configure Your .env File
1. Open the `.env` file in the root directory of your project
2. Replace `your_github_token_here` with your actual token:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USER=AdiCheats
GITHUB_REPO=AimkillAuth
DATA_FILE=user.json
```

### Step 4: Restart Your Server
After updating the `.env` file:
1. Stop your server (Ctrl+C in terminal)
2. Start it again with: `npm run dev`

## Verification
After restarting, you should see in the console:
```
✓ GitHub configuration loaded successfully
  Repository: AdiCheats/AimkillAuth
  Data File: user.json
```

If you see errors about "Bad credentials", your token is invalid or missing.

## Security Notes
- **NEVER** commit your `.env` file to Git
- **NEVER** share your GitHub token publicly
- The `.env` file is already in `.gitignore` to prevent accidental commits
- If you accidentally expose your token, delete it immediately from GitHub settings

## Current Configuration
Based on your terminal output, you need:
- **GITHUB_TOKEN**: Your personal access token (starts with `ghp_`)
- **GITHUB_USER**: `AdiCheats`
- **GITHUB_REPO**: `AimkillAuth`
- **DATA_FILE**: `user.json`

## Troubleshooting

### "Bad credentials" error
- Your token is invalid or expired
- Create a new token following Step 2 above

### "404 Not Found" error
- The repository doesn't exist
- Create the repository following Step 1

### "403 Forbidden" error
- Your token doesn't have the right permissions
- Make sure you selected **repo** scope when creating the token

### Still not working?
Check your `.env` file:
1. No spaces around the `=` sign
2. No quotes around the values
3. The file is named exactly `.env` (not `.env.txt`)
4. The file is in the root directory of your project

