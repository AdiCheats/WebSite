# 🔐 AdiCheats License Authentication - API Key System

## 📋 Overview

Your license authentication system has been updated to use **API Keys** instead of Application IDs. This provides better security and easier integration.

---

## 🆕 What Changed

### ✅ Changes Made

1. **API Key Authentication** - Now uses API key from dashboard instead of Application ID
2. **Backend Validation** - Server validates API key before processing license
3. **No Discord URLs** - All Discord references removed
4. **Cleaner Code** - Simplified authentication flow

### ❌ Removed

- Application ID parameter
- Discord URL references
- Social media buttons
- External links

### ➕ Added

- API Key validation in headers (`X-API-Key`)
- Better error messages
- Automatic application detection from API key

---

## 🚀 Quick Start Guide

### Step 1: Get Your API Key (30 seconds)

1. Go to: https://adicheats.auth.kesug.com
2. Navigate to **App Management**
3. Click on your application
4. Copy the **API Key** (shown at the top)

Example API Key: `xYfG1ebdjPavaPTE8keR-nPbN78G3Uge`

---

### Step 2: Configure Auth.java (1 minute)

```java
Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("xYfG1ebdjPavaPTE8keR-nPbN78G3Uge") // ← YOUR API KEY
    .setAppVersion("1.0")
    .initialize();
```

**That's it!** The system automatically detects which application you're using from the API key.

---

### Step 3: Validate License (2 minutes)

```java
String licenseKey = "AIMKILL-ABC123-XYZ789";

auth.validateLicense(licenseKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        // ✓ License is valid!
        Toast.makeText(context, 
            "Welcome! License expires in " + response.getDaysRemaining() + " days", 
            Toast.LENGTH_LONG).show();
        
        // Continue to your app
        startMainActivity();
    }
    
    @Override
    public void onError(String error) {
        // ✗ License is invalid
        Toast.makeText(context, "Error: " + error, Toast.LENGTH_LONG).show();
    }
});
```

---

## 📁 Files

### Updated Files

1. **`Auth.java`** - Main authentication class
   - Uses API Key instead of Application ID
   - Sends `X-API-Key` header with requests
   - Auto-detects application

2. **`LoginExample.java`** - Example login UI
   - No Discord URLs
   - Simplified error handling
   - Clean, minimal UI

3. **`server/routes.ts`** - Backend API
   - Validates API key from headers
   - Auto-detects application ID
   - Better error responses

---

## 🔧 Configuration Reference

### Auth Class Methods

#### `setApiUrl(String url)`
Sets the API base URL.
```java
auth.setApiUrl("https://adicheats.auth.kesug.com/api/v1");
```

#### `setApiKey(String key)`
Sets your application API key (from dashboard).
```java
auth.setApiKey("YOUR-API-KEY-HERE");
```

#### `setAppVersion(String version)`
Sets your application version.
```java
auth.setAppVersion("1.0");
```

#### `initialize()`
Initializes the auth system and logs configuration.
```java
auth.initialize();
```

---

## 📡 API Communication

### Request Format

**Endpoint:**
```
POST https://adicheats.auth.kesug.com/api/v1/license/validate
```

**Headers:**
```
Content-Type: application/json
X-API-Key: YOUR-API-KEY-HERE
User-Agent: AdiCheats-Android/1.0
```

**Body:**
```json
{
  "licenseKey": "AIMKILL-ABC123-XYZ789",
  "hwid": "9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D..."
}
```

### Success Response

```json
{
  "success": true,
  "message": "License is valid",
  "license": {
    "id": "abc123def456",
    "licenseKey": "AIMKILL-ABC123-XYZ789",
    "applicationId": 1,
    "maxUsers": 1,
    "currentUsers": 0,
    "validityDays": 30,
    "expiresAt": "2025-12-31T23:59:59.999Z",
    "isActive": true,
    "isBanned": false,
    "hwid": "9A8B7C6D...",
    "hwidLockEnabled": true,
    "description": "Premium License",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid license key"
}
```

---

## 🚨 Error Handling

### Error Types

| Error Type | Message Prefix | Description |
|------------|---------------|-------------|
| Invalid API Key | `Invalid API key` | API key not found or incorrect |
| Invalid License | `INVALID_LICENSE:` | License key not found |
| Expired License | `LICENSE_EXPIRED:` | License has expired |
| Banned License | `LICENSE_BANNED:` | License is banned |
| HWID Mismatch | `HWID_MISMATCH:` | Device doesn't match locked HWID |
| User Limit | `USER_LIMIT_REACHED:` | Maximum users reached |

### Handling Errors in Code

```java
@Override
public void onError(String error) {
    if (error.contains("Invalid API key")) {
        // API key is wrong - check your configuration
        Log.e("Auth", "Invalid API key! Check your dashboard.");
        
    } else if (error.startsWith("INVALID_LICENSE:")) {
        // License key doesn't exist
        showError("Invalid license key");
        
    } else if (error.startsWith("LICENSE_EXPIRED:")) {
        // License has expired
        showExpiredDialog();
        
    } else if (error.startsWith("HWID_MISMATCH:")) {
        // Device mismatch
        showHwidMismatchDialog();
        
    } else {
        // Generic error
        showError("Error: " + error);
    }
}
```

---

## 🧪 Testing

### Test 1: Valid API Key + Valid License

```java
Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("xYfG1ebdjPavaPTE8keR-nPbN78G3Uge") // Valid API key
    .setAppVersion("1.0")
    .initialize();

String validLicense = "AIMKILL-ABC123-XYZ789"; // From dashboard

auth.validateLicense(validLicense, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        Log.d("Test", "✓ SUCCESS - License is valid!");
        Log.d("Test", "Expires: " + response.expiresAt);
        Log.d("Test", "Days remaining: " + response.getDaysRemaining());
    }
    
    @Override
    public void onError(String error) {
        Log.e("Test", "✗ FAILED - " + error);
    }
});
```

**Expected:** ✓ Success

---

### Test 2: Invalid API Key

```java
Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("INVALID-KEY-12345") // Invalid API key
    .setAppVersion("1.0")
    .initialize();

auth.validateLicense("ANY-LICENSE-KEY", callback);
```

**Expected:** ✗ Error: "Invalid API key"

---

### Test 3: Valid API Key + Invalid License

```java
Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("xYfG1ebdjPavaPTE8keR-nPbN78G3Uge") // Valid API key
    .setAppVersion("1.0")
    .initialize();

auth.validateLicense("INVALID-LICENSE-KEY", callback);
```

**Expected:** ✗ Error: "INVALID_LICENSE: Invalid license key"

---

### Test 4: HWID Lock

1. Create license with HWID lock enabled in dashboard
2. First login on Device A: ✓ Success (HWID is saved)
3. Same license on Device B: ✗ Error: "HWID_MISMATCH"
4. Reset HWID in dashboard
5. Device B login: ✓ Success (new HWID is saved)

---

## 📱 Complete Example App

### MainActivity.java

```java
package com.adicheats;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.*;
import com.adicheats.Auth;

public class MainActivity extends Activity {
    
    private static final String API_KEY = "xYfG1ebdjPavaPTE8keR-nPbN78G3Uge";
    private Auth auth;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Auth
        auth = new Auth(this)
            .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
            .setApiKey(API_KEY)
            .setAppVersion("1.0")
            .initialize();
        
        // Check if already logged in
        if (isLoggedIn()) {
            launchApp();
        } else {
            showLoginScreen();
        }
    }
    
    private void showLoginScreen() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 50, 50, 50);
        
        TextView title = new TextView(this);
        title.setText("AdiCheats Login");
        title.setTextSize(24);
        
        EditText input = new EditText(this);
        input.setHint("Enter License Key");
        
        Button loginBtn = new Button(this);
        loginBtn.setText("Login");
        loginBtn.setOnClickListener(v -> {
            String key = input.getText().toString().trim();
            if (key.isEmpty()) {
                Toast.makeText(this, "Please enter license key", Toast.LENGTH_SHORT).show();
                return;
            }
            
            login(key);
        });
        
        layout.addView(title);
        layout.addView(input);
        layout.addView(loginBtn);
        setContentView(layout);
    }
    
    private void login(String licenseKey) {
        auth.validateLicense(licenseKey, new Auth.AuthCallback() {
            @Override
            public void onSuccess(Auth.AuthResponse response) {
                // Save session
                SharedPreferences prefs = getSharedPreferences("AdiCheats", MODE_PRIVATE);
                prefs.edit()
                    .putBoolean("logged_in", true)
                    .putString("license_key", response.licenseKey)
                    .putString("expires_at", response.expiresAt)
                    .putInt("days_remaining", response.getDaysRemaining())
                    .apply();
                
                Toast.makeText(MainActivity.this,
                    "Welcome! " + response.getDaysRemaining() + " days remaining",
                    Toast.LENGTH_LONG).show();
                
                launchApp();
            }
            
            @Override
            public void onError(String error) {
                Toast.makeText(MainActivity.this,
                    "Login failed: " + error,
                    Toast.LENGTH_LONG).show();
            }
        });
    }
    
    private boolean isLoggedIn() {
        SharedPreferences prefs = getSharedPreferences("AdiCheats", MODE_PRIVATE);
        return prefs.getBoolean("logged_in", false);
    }
    
    private void launchApp() {
        // TODO: Launch your main app here
        Toast.makeText(this, "App launched!", Toast.LENGTH_SHORT).show();
    }
}
```

---

## 🔍 Debugging

### Enable Logging

```bash
adb logcat -s AdiAuth
```

### Expected Log Output

```
D/AdiAuth: === AdiCheats Auth Configuration ===
D/AdiAuth: API URL: https://adicheats.auth.kesug.com/api/v1
D/AdiAuth: API Key: xYfG1ebd...
D/AdiAuth: App Version: 1.0
D/AdiAuth: Device HWID: 9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D...
D/AdiAuth: ====================================
D/AdiAuth: Validating license key: AIMKILL-ABC123-XYZ789
D/AdiAuth: Endpoint: https://adicheats.auth.kesug.com/api/v1/license/validate
D/AdiAuth: Request body: {"licenseKey":"AIMKILL-ABC123-XYZ789","hwid":"9A8B7C..."}
D/AdiAuth: Response code: 200
D/AdiAuth: Response body: {"success":true,"message":"License is valid",...}
D/AdiAuth: ✓ License validation successful!
D/AdiAuth: License expires: 2025-12-31T23:59:59.999Z
D/AdiAuth: HWID locked: true
```

### Common Issues

#### Issue: "Invalid API key"

**Cause:** API key is wrong or not set

**Fix:**
1. Go to dashboard
2. Copy your API key
3. Update `setApiKey("YOUR-KEY-HERE")`
4. Rebuild app

---

#### Issue: "Network error: Unable to resolve host"

**Cause:** No internet connection

**Fix:**
1. Check device internet connection
2. Verify API URL is correct
3. Test in browser: https://adicheats.auth.kesug.com

---

#### Issue: License validation always fails

**Cause:** License key belongs to different application

**Fix:**
1. Verify API key is correct
2. Create license key in correct application
3. Ensure license is not expired or banned

---

## 📊 Dashboard Guide

### Where to Find Your API Key

1. Login to: https://adicheats.auth.kesug.com
2. Click **App Management** in sidebar
3. Click on your application
4. API Key is shown at the top: `xYfG1ebdjPavaPTE8keR-nPbN78G3Uge`
5. Click copy icon to copy

### Creating License Keys

1. Go to **App Management**
2. Click on your application
3. Click **Licenses** tab
4. Click **Create License**
5. Fill in details:
   - License Key (auto-generated or custom)
   - Validity Days
   - HWID Lock (enable/disable)
   - Description (optional)
6. Click **Create**

### Managing Licenses

**Reset HWID:**
- Click 🔄 icon next to license
- HWID is cleared, allows new device

**Lock Custom HWID:**
- Click 🛡️ icon
- Enter HWID (get from app logs)
- License locks to that device

**Ban License:**
- Click ban button
- License can no longer be used

**Delete License:**
- Click 🗑️ icon
- Confirm deletion
- License is permanently removed

---

## 🔐 Security Best Practices

### 1. Protect Your API Key

```java
// ❌ BAD - Hardcoded API key
Auth auth = new Auth(context)
    .setApiKey("xYfG1ebdjPavaPTE8keR-nPbN78G3Uge");

// ✓ GOOD - Load from secure storage or obfuscate
String apiKey = getApiKeyFromSecureStorage();
Auth auth = new Auth(context)
    .setApiKey(apiKey);
```

### 2. Validate Periodically

```java
// Re-validate every 24 hours
Handler handler = new Handler();
handler.postDelayed(new Runnable() {
    @Override
    public void run() {
        String savedKey = prefs.getString("license_key", "");
        auth.validateLicense(savedKey, callback);
        
        // Schedule next validation
        handler.postDelayed(this, 24 * 60 * 60 * 1000);
    }
}, 24 * 60 * 60 * 1000);
```

### 3. Handle Expired Licenses

```java
@Override
public void onSuccess(Auth.AuthResponse response) {
    // Check if expiring soon
    if (response.getDaysRemaining() < 7) {
        showExpiryWarning(response.getDaysRemaining());
    }
    
    // Save session
    saveSession(response);
}
```

### 4. Secure HWID

The HWID is automatically generated using:
- Android ID
- Device manufacturer
- Device model
- SHA-256 hashing

This ensures each device has a unique, consistent identifier.

---

## 📞 Support

### Dashboard
https://adicheats.auth.kesug.com

### Documentation Files
- `AUTH_JAVA_COMPLETE_GUIDE.md` - Full documentation
- `JAVA_LICENSE_QUICK_START.md` - Quick start guide
- `AUTH_JAVA_API_KEY_SYSTEM.md` - This file

---

## ✅ Checklist

Before deploying:

- [ ] Got API key from dashboard
- [ ] Set API key in `Auth.java` or `LoginExample.java`
- [ ] Tested with valid license key
- [ ] Tested with invalid license key
- [ ] Tested HWID lock (if using)
- [ ] Tested error handling
- [ ] Checked logs for any errors
- [ ] Removed debug/test code
- [ ] Obfuscated/secured API key
- [ ] Tested on real device
- [ ] Verified expiry dates work correctly

---

## 🎉 Summary

### What You Get

✅ **Simple Configuration** - Just API key, no Application ID needed  
✅ **Automatic Detection** - Server finds your app from API key  
✅ **Better Security** - API key validation at server level  
✅ **Clean Code** - No external URLs or social media links  
✅ **Easy Testing** - Clear error messages and logging  
✅ **Production Ready** - Robust error handling and validation  

### How It Works

1. App sends license key + HWID
2. Includes API key in `X-API-Key` header
3. Server validates API key → finds application
4. Server validates license key for that application
5. Server checks HWID, expiry, ban status
6. Returns success or specific error

**That's it! Your license system is ready to use!** 🚀

---

*Created by Adi for AdiCheats*  
*© 2025 AdiCheats. All rights reserved.*

