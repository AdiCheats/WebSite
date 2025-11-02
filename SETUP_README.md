# 🚀 ADI CHEATS - Setup & Troubleshooting

## 🎯 Quick Start (New Installation)

### Prerequisites
- Node.js installed
- GitHub account
- Git installed

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see below)
# Create .env in project root

# 3. Start development server
npm run dev
```

---

## 📝 Environment Configuration

### Create .env File

Create a file named `.env` in your project root directory:

**Location:** `C:\Users\Adii\Desktop\Auth Hosted\Web-main\.env`

**Content:**
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

### Get Your GitHub Token

1. **Visit:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Settings:**
   - Name: `AdiCheats Auth System`
   - Expiration: Choose your preference
   - Scopes: ✅ **repo** (Full control of private repositories)
4. **Click:** "Generate token"
5. **Copy** the token (starts with `ghp_`)
6. **Paste** it in your `.env` file

### Verify Configuration

Run the configuration checker:

**Windows:**
```powershell
.\check-env.ps1
```

**Expected Output:**
```
✓ GitHub configuration loaded successfully
  Repository: AdiCheats/AimkillAuth
  Data File: user.json
  Token: ghp_xxxx...xxxx
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Bad credentials" (401 Error)

**Symptoms:**
- No applications showing
- GitHub API error 401
- "Bad credentials" in console

**Solution:**
1. Check `.env` file exists
2. Verify `GITHUB_TOKEN` is set correctly
3. Token should start with `ghp_`
4. Make sure token has **repo** scope
5. Restart server after changes

**Quick Fix:**
```bash
# Stop server (Ctrl+C)
# Edit .env file with correct token
npm run dev
```

---

### Issue 2: User Creation Shows Generic "400" Error

**Symptoms:**
- Creating user shows "Failed to create user 400"
- No specific error message

**Status:** ✅ FIXED in latest version

**What Was Fixed:**
- Error handling now properly displays specific messages
- You'll see errors like:
  - "Username already exists in this application"
  - "Invalid or expired license key"
  - "License key has reached maximum user limit"

**If You Still See This:**
- Make sure you pulled the latest changes
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

---

### Issue 3: Repository Not Found (404)

**Solution:**
1. Create repository at: https://github.com/new
2. Name: `AimkillAuth`
3. Type: Private (recommended)
4. Click "Create repository"
5. Restart your server

---

## 📂 Important Files

### Configuration Files
- `.env` - Your environment variables (create this!)
- `.env.example` - Template (if needed)

### Setup Guides
- `QUICK_FIX.txt` - Quick reference card
- `ENV_SETUP_SUMMARY.md` - Quick setup guide
- `GITHUB_SETUP_GUIDE.md` - Detailed setup with explanations
- `FIXES_SUMMARY.md` - Overview of all fixes applied

### Helper Scripts
- `check-env.ps1` - Verify your configuration

---

## 🔒 Security Best Practices

### DO:
- ✅ Keep `.env` file private
- ✅ Use strong, unique secrets
- ✅ Regularly rotate tokens
- ✅ Use private GitHub repository
- ✅ Enable 2FA on GitHub

### DON'T:
- ❌ Commit `.env` to Git (already in .gitignore)
- ❌ Share your GitHub token
- ❌ Use tokens with more permissions than needed
- ❌ Use default passwords in production

---

## 📊 Project Structure

```
Web-main/
├── .env                    # Your configuration (create this!)
├── .env.example           # Template
├── server/                # Backend code
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── githubService.ts  # GitHub integration
│   └── environment.ts    # Config loader
├── client/               # Frontend code
│   └── src/
│       ├── pages/        # React pages
│       └── lib/          # Utilities
└── Documentation files
```

---

## 🚀 Development Workflow

### Starting Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run check
```

---

## 🆘 Getting Help

### Step-by-Step Guides
1. **Quick Fix:** Read `QUICK_FIX.txt`
2. **Setup:** Read `ENV_SETUP_SUMMARY.md`
3. **Detailed:** Read `GITHUB_SETUP_GUIDE.md`

### Verify Setup
```powershell
.\check-env.ps1
```

### Check Server Logs
Look for these messages when starting:
- ✅ `✓ GitHub configuration loaded successfully`
- ❌ `❌ CRITICAL: Missing GitHub configuration`

---

## 📋 Checklist

Before you start:
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] GitHub account created
- [ ] GitHub repository created (`AimkillAuth`)
- [ ] GitHub token generated (with **repo** scope)
- [ ] `.env` file created
- [ ] Configuration verified (`.\check-env.ps1`)
- [ ] Server started (`npm run dev`)

---

## ✨ Features

Once setup is complete, you'll have access to:
- 🔐 User authentication system
- 📱 Application management
- 🔑 License key generation
- 👥 User management
- 📊 Activity logs
- 🚫 Blacklist management
- 🪝 Webhook integration
- 💾 GitHub-based storage (no database needed!)

---

## 🎉 Success!

If you see this on startup, you're good to go:

```
✓ GitHub configuration loaded successfully
  Repository: AdiCheats/AimkillAuth
  Data File: user.json
  Token: ghp_xxxx...xxxx

Server running at: http://localhost:5000
```

Open your browser to `http://localhost:5000` and start using ADI CHEATS!

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Author:** ADI CHEATS

