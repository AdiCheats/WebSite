# 🔒 Security Setup Guide

## ⚠️ IMPORTANT: Environment Variables

Your `.env` file has been removed from git for security reasons. This file contains sensitive credentials that should NEVER be committed to version control.

---

## 📋 Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# GitHub Backend Configuration (for data storage)
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_BRANCH=main

# Firebase Configuration (for admin authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=generate_a_random_secret_key_here
```

---

## 🔑 How to Get Your Credentials

### GitHub Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy the token to `GITHUB_TOKEN`

### Firebase Configuration
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Copy each value to the corresponding `VITE_FIREBASE_*` variable

### Session Secret
Generate a random string (at least 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Security Best Practices

1. **NEVER commit `.env` to git** - It's now in `.gitignore`
2. **Use different credentials for production** - Don't reuse development keys
3. **Rotate tokens regularly** - Especially if you suspect they've been exposed
4. **Limit token permissions** - Only grant necessary access
5. **Use environment-specific files** - `.env.development`, `.env.production`

---

## 🔍 What Was Fixed

GitHub blocked your push because you tried to commit a `.env` file containing:
- GitHub Personal Access Token
- Other sensitive credentials

**Actions Taken:**
1. ✅ Removed `.env` from git repository
2. ✅ Added proper `.gitignore` file
3. ✅ Removed `.env` from git history
4. ✅ Successfully pushed to GitHub without secrets

---

## 📝 Next Steps

1. **Recreate your `.env` file** locally (not in git)
2. **Fill in your actual credentials**
3. **Restart your server:** `npm run dev`
4. **Test your application**

---

## ⚠️ If Your Token Was Exposed

If your GitHub token was already pushed to GitHub before:

1. **Revoke the token immediately:**
   - Go to https://github.com/settings/tokens
   - Find the exposed token
   - Click "Delete"

2. **Generate a new token**

3. **Update your local `.env` file**

4. **Check GitHub's security alerts** for any unauthorized access

---

## 📚 Additional Resources

- [GitHub Token Security](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Managing Sensitive Data](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember:** Your `.env` file should be in your project root, but NEVER committed to git. The `.gitignore` file now prevents this automatically! 🔒

