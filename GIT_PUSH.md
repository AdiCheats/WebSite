# Git Commands to Push to GitHub

## Quick Push (All Changes)

```powershell
# 1. Navigate to project directory
cd "C:\Users\Adii\Desktop\Auth Hosted\Web-main"

# 2. Check status (see what changed)
git status

# 3. Add all changes
git add .

# 4. Commit with message
git commit -m "Fix license system: Add embedded application data, fix route order, update Auth.java"

# 5. Push to GitHub
git push
```

## Step-by-Step (Safer)

```powershell
# Step 1: Check what files changed
cd "C:\Users\Adii\Desktop\Auth Hosted\Web-main"
git status

# Step 2: Review changes (optional)
git diff

# Step 3: Add specific files (or all)
git add .
# OR add specific files:
# git add Auth.java
# git add LoginExample.java
# git add server/routes.ts
# git add server/licenseService.ts
# git add server/auth.ts
# git add client/src/pages/simple-login.tsx

# Step 4: Commit
git commit -m "Complete license system fix:
- Added embedded application data to License.json
- Fixed route order for /api/v1/license/validate
- Updated Auth.java with full functionality
- Removed KeyAuth references from login page
- Added realtime management features"

# Step 5: Push
git push
```

## If Push Fails (Need to Pull First)

```powershell
# Pull latest changes first
git pull

# If there are conflicts, resolve them, then:
git add .
git commit -m "Merge remote changes"
git push
```

## Force Push (Only if absolutely necessary!)

```powershell
# ⚠️ WARNING: Only use if you know what you're doing!
git push --force
```

## Check Remote Repository

```powershell
# See which remote repository
git remote -v

# If you need to set remote URL
# git remote set-url origin https://github.com/YourUsername/YourRepo.git
```

---

**Quick Copy-Paste (All-in-One):**

```powershell
cd "C:\Users\Adii\Desktop\Auth Hosted\Web-main"
git add .
git commit -m "Fix license system with embedded app data and update login page"
git push
```

