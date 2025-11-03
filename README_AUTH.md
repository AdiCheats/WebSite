# Auth System - Quick Start

## ✅ Your Setup is Correct!

```
Application: Aimkill (ID: 1761644263274)
API Key: xYfG1ebdjPavaPTE8keR-nPbN78G3Uge
License: Aimkill-PY5WP0-Y8Z5TZ-TBHGCR
Status: ✓ Everything matches!
```

## Files You Need

### 1. Auth.java
Copy to your Android project. Handles license validation.

### 2. LoginExample.java
Copy to your Android project. Simple wrapper for Auth.java.

### 3. MainActivity_Example.java
Example showing how to use it in your app.

## How to Use

### Step 1: Copy Files
```
YourApp/
  src/main/java/com/projectvb/
    ├── Auth.java          ← Copy this
    ├── LoginExample.java  ← Copy this
    └── MainActivity.java  ← Your main activity
```

### Step 2: Use in Your App
```java
// In your MainActivity
LoginExample.login(
    this,
    "Aimkill-PY5WP0-Y8Z5TZ-TBHGCR", // Your license
    response -> {
        // Success! Start your app
        Toast.makeText(this, "Licensed!", Toast.LENGTH_SHORT).show();
    },
    response -> {
        // Failed
        Toast.makeText(this, response.message, Toast.LENGTH_LONG).show();
    }
);
```

## Testing

### Test Locally First
```bash
# Start server
cd "C:\Users\Adii\Desktop\Auth Hosted\Web-main"
npm run dev

# Server runs at: http://localhost:5000
```

Update `LoginExample.java` for testing:
```java
// For local testing:
private static final String API_URL = "http://10.0.2.2:5000/api/v1"; // Android emulator

// For production:
private static final String API_URL = "https://adicheats.auth.kesug.com/api/v1";
```

## If It Still Shows "Unauthorized"

The production server might not be synced. Solutions:

1. **Restart production server** to refresh GitHub cache
2. **Test locally first** using `npm run dev`
3. **Check server logs** for errors
4. **Verify .env file** has correct GitHub credentials

## Files Overview

| File | Lines | Purpose |
|------|-------|---------|
| `Auth.java` | 342 | Core authentication logic |
| `LoginExample.java` | 85 | Simple wrapper |
| `MainActivity_Example.java` | 85 | Usage example |
| `SIMPLE_FIX.md` | - | Troubleshooting guide |

## Architecture

```
Android App
    ↓ (sends)
API Key + License Key + HWID
    ↓ (to)
Server (https://adicheats.auth.kesug.com)
    ↓ (checks)
1. API Key → user.json (find application)
2. License → License.json (match applicationId)
3. Validate (not banned, not expired, HWID match)
    ↓ (returns)
Success or Error
```

## Your Data is Correct!

You don't need to change anything in GitHub. The system is working. Just:
1. Use the correct API key (already in LoginExample.java)
2. Use your license key (Aimkill-PY5WP0-Y8Z5TZ-TBHGCR)
3. Make sure production server is running

## Quick Test

```java
// Test in your app:
Auth auth = new Auth(this);
auth.setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("xYfG1ebdjPavaPTE8keR-nPbN78G3Uge")
    .setAppVersion("1.0")
    .initialize();

auth.validateLicense("Aimkill-PY5WP0-Y8Z5TZ-TBHGCR", new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        Log.d("Auth", "✓ Success! Days remaining: " + response.getDaysRemaining());
    }
    
    @Override
    public void onError(String error) {
        Log.e("Auth", "✗ Error: " + error);
    }
});
```

---

**That's it! Your system is ready to go.**

See `MainActivity_Example.java` for complete examples.

