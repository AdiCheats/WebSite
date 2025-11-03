# AdiCheats License Authentication - Complete Java/Android Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Files](#files)
4. [Quick Start](#quick-start)
5. [Configuration](#configuration)
6. [API Documentation](#api-documentation)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## 📋 Overview

This is a **production-ready** license authentication system for Java/Android applications that integrates with your AdiCheats license API.

### What It Does
✅ Validates license keys via REST API  
✅ Handles Hardware ID (HWID) locking automatically  
✅ Checks expiration dates  
✅ Detects banned licenses  
✅ Manages user limits  
✅ Provides detailed error messages  
✅ Works on Android devices and emulators  

---

## 🚀 Features

### Core Features
- **License Key Validation**: Validates license keys with your server
- **HWID Management**: Automatic hardware ID generation and validation
- **Expiration Checking**: Detects expired licenses
- **Ban Detection**: Identifies banned licenses
- **User Limits**: Enforces maximum user limits
- **Error Handling**: Comprehensive error handling with specific error types

### Security Features
- **SHA-256 HWID**: Secure device fingerprinting
- **HTTPS Communication**: Encrypted API calls
- **No Hardcoded Keys**: All configuration is external

### Android Features
- **Async Operations**: Non-blocking network calls
- **Handler Support**: UI updates on main thread
- **SharedPreferences**: Session management
- **Material Design**: Beautiful login UI

---

## 📁 Files

### Core Files

**1. `Auth.java`** (Main authentication class)
```
Package: com.adicheats
Size: ~500 lines
Purpose: Core license validation and HWID management
```

**2. `LoginExample.java`** (Example implementation)
```
Package: com.adicheats
Size: ~400 lines
Purpose: Complete login UI and flow demonstration
```

**3. `AUTH_JAVA_COMPLETE_GUIDE.md`** (This file)
```
Purpose: Complete documentation and examples
```

---

## ⚡ Quick Start

### Step 1: Add Files to Your Project

Copy these files to your Android project:

```
app/src/main/java/com/adicheats/
├── Auth.java
└── LoginExample.java (optional, for reference)
```

### Step 2: Add Permissions

Add to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Step 3: Initialize Auth

```java
// In your Login Activity
Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApplicationId(1) // Your app ID from dashboard
    .setAppVersion("1.0")
    .initialize();
```

### Step 4: Validate License

```java
String licenseKey = "YOUR-LICENSE-KEY";

auth.validateLicense(licenseKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        // Login successful!
        Toast.makeText(context, "Welcome!", Toast.LENGTH_SHORT).show();
        
        // Save session and continue
        saveSession(response);
        continueToApp();
    }
    
    @Override
    public void onError(String error) {
        // Login failed
        Toast.makeText(context, "Error: " + error, Toast.LENGTH_LONG).show();
    }
});
```

**That's it!** You now have a working license system. 🎉

---

## ⚙️ Configuration

### Required Configuration

#### 1. API URL
Your auth API base URL:
```java
auth.setApiUrl("https://adicheats.auth.kesug.com/api/v1");
```

#### 2. Application ID
Get this from your dashboard (App Management section):
```java
auth.setApplicationId(1); // Replace with your app ID
```

#### 3. App Version
Your application version (used for version checking):
```java
auth.setAppVersion("1.0");
```

### Optional Configuration

#### Custom Package Name
Change package name in both files:
```java
package com.yourcompany.yourapp;
```

#### Discord URL
Update in `LoginExample.java`:
```java
private static final String DISCORD_URL = "https://discord.gg/YOURSERVER";
```

---

## 📖 API Documentation

### Auth Class

#### Constructor

```java
public Auth(Context context)
```
**Parameters:**
- `context`: Android context (required for HWID generation)

**Example:**
```java
Auth auth = new Auth(this);
```

---

#### Configuration Methods

**`setApiUrl(String url)`**
```java
public Auth setApiUrl(String url)
```
Sets the API base URL.

**Parameters:**
- `url`: API base URL (e.g., "https://adicheats.auth.kesug.com/api/v1")

**Returns:** `this` (for method chaining)

**Example:**
```java
auth.setApiUrl("https://adicheats.auth.kesug.com/api/v1");
```

---

**`setApplicationId(int appId)`**
```java
public Auth setApplicationId(int appId)
```
Sets your application ID.

**Parameters:**
- `appId`: Your application ID from dashboard

**Returns:** `this` (for method chaining)

**Example:**
```java
auth.setApplicationId(1);
```

---

**`setAppVersion(String version)`**
```java
public Auth setAppVersion(String version)
```
Sets your application version.

**Parameters:**
- `version`: Version string (e.g., "1.0", "2.5.1")

**Returns:** `this` (for method chaining)

**Example:**
```java
auth.setAppVersion("1.0");
```

---

**`initialize()`**
```java
public Auth initialize()
```
Initializes the auth system and logs configuration.

**Returns:** `this` (for method chaining)

**Example:**
```java
auth.initialize();
```

---

#### Validation Method

**`validateLicense(String licenseKey, AuthCallback callback)`**
```java
public void validateLicense(String licenseKey, AuthCallback callback)
```
Validates a license key asynchronously.

**Parameters:**
- `licenseKey`: The license key to validate
- `callback`: Callback for result (success or error)

**Example:**
```java
auth.validateLicense("AIMKILL-ABC123-XYZ789", new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        // Handle success
    }
    
    @Override
    public void onError(String error) {
        // Handle error
    }
});
```

---

#### Utility Methods

**`getHWID()`**
```java
public String getHWID()
```
Gets the current device's hardware ID.

**Returns:** SHA-256 hash of device identifier

**Example:**
```java
String hwid = auth.getHWID();
Log.d("Auth", "Device HWID: " + hwid);
```

---

**`getApiUrl()`**
```java
public String getApiUrl()
```
Gets the configured API URL.

**Returns:** API base URL

---

**`getAppVersion()`**
```java
public String getAppVersion()
```
Gets the configured app version.

**Returns:** App version string

---

**`getApplicationId()`**
```java
public int getApplicationId()
```
Gets the configured application ID.

**Returns:** Application ID

---

### AuthResponse Class

Returned on successful validation.

#### Fields

```java
public class AuthResponse {
    public boolean success;           // Always true on success
    public String message;             // Success message
    public String licenseKey;          // The validated license key
    public int applicationId;          // Application ID
    public int maxUsers;               // Maximum allowed users
    public int currentUsers;           // Current user count
    public int validityDays;           // License validity in days
    public String expiresAt;           // ISO 8601 expiry date
    public boolean isActive;           // Is license active
    public boolean isBanned;           // Is license banned
    public String hwid;                // Current HWID (if locked)
    public boolean hwidLockEnabled;    // Is HWID lock enabled
    public String description;         // License description
}
```

#### Methods

**`isExpired()`**
```java
public boolean isExpired()
```
Checks if the license has expired.

**Returns:** `true` if expired, `false` otherwise

**Example:**
```java
if (response.isExpired()) {
    showExpiredDialog();
}
```

---

**`isValid()`**
```java
public boolean isValid()
```
Checks if license is fully valid (active, not banned, not expired).

**Returns:** `true` if valid, `false` otherwise

**Example:**
```java
if (response.isValid()) {
    continueToApp();
} else {
    showError();
}
```

---

**`getDaysRemaining()`**
```java
public int getDaysRemaining()
```
Gets the number of days until expiration.

**Returns:** Days remaining (-1 if expired or error)

**Example:**
```java
int days = response.getDaysRemaining();
Toast.makeText(context, "License expires in " + days + " days", Toast.LENGTH_SHORT).show();
```

---

**`getFormattedExpiryDate()`**
```java
public String getFormattedExpiryDate()
```
Gets a human-readable expiry date.

**Returns:** Formatted date string (e.g., "Dec 31, 2025")

**Example:**
```java
String expiryDate = response.getFormattedExpiryDate();
Log.d("Auth", "Expires on: " + expiryDate);
```

---

### AuthCallback Interface

Callback for async license validation.

```java
public interface AuthCallback {
    void onSuccess(AuthResponse response);
    void onError(String error);
}
```

**`onSuccess(AuthResponse response)`**
- Called when validation succeeds
- `response` contains license details

**`onError(String error)`**
- Called when validation fails
- `error` contains error message with type prefix

---

## 🚨 Error Handling

### Error Types

Errors are returned with type prefixes for easy handling:

| Error Type | Prefix | Description |
|------------|--------|-------------|
| **Expired** | `LICENSE_EXPIRED:` | License has expired |
| **Banned** | `LICENSE_BANNED:` | License is banned |
| **HWID Mismatch** | `HWID_MISMATCH:` | Device doesn't match locked HWID |
| **Invalid** | `INVALID_LICENSE:` | License key is invalid |
| **User Limit** | `USER_LIMIT_REACHED:` | Max users reached |
| **Network** | `Network error:` | Connection/server error |
| **Generic** | (no prefix) | Other errors |

### Handling Errors

```java
auth.validateLicense(licenseKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(AuthResponse response) {
        // Success handling
    }
    
    @Override
    public void onError(String error) {
        if (error.startsWith("LICENSE_EXPIRED:")) {
            showExpiredDialog();
        } else if (error.startsWith("LICENSE_BANNED:")) {
            showBannedDialog();
        } else if (error.startsWith("HWID_MISMATCH:")) {
            showHwidMismatchDialog();
        } else if (error.startsWith("INVALID_LICENSE:")) {
            Toast.makeText(context, "Invalid license key", Toast.LENGTH_SHORT).show();
        } else if (error.startsWith("USER_LIMIT_REACHED:")) {
            showUserLimitDialog();
        } else {
            Toast.makeText(context, "Error: " + error, Toast.LENGTH_LONG).show();
        }
    }
});
```

### Example Error Dialogs

**Expired License:**
```java
private void showExpiredDialog() {
    new AlertDialog.Builder(context)
        .setTitle("License Expired")
        .setMessage("Your license has expired. Please renew to continue.")
        .setPositiveButton("Renew", (dialog, which) -> {
            // Open Discord or purchase page
            Intent intent = new Intent(Intent.ACTION_VIEW, 
                Uri.parse("https://discord.gg/qEUP6rzCYV"));
            context.startActivity(intent);
        })
        .setNegativeButton("OK", null)
        .show();
}
```

**HWID Mismatch:**
```java
private void showHwidMismatchDialog() {
    new AlertDialog.Builder(context)
        .setTitle("Device Mismatch")
        .setMessage("This license is locked to another device.\n\n" +
                   "Your HWID: " + auth.getHWID().substring(0, 32) + "...\n\n" +
                   "Contact support to reset HWID.")
        .setPositiveButton("Contact Support", (dialog, which) -> {
            Intent intent = new Intent(Intent.ACTION_VIEW, 
                Uri.parse("https://discord.gg/qEUP6rzCYV"));
            context.startActivity(intent);
        })
        .setNegativeButton("OK", null)
        .show();
}
```

---

## 💡 Examples

### Example 1: Simple Login

```java
public class MainActivity extends Activity {
    private Auth auth;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Auth
        auth = new Auth(this)
            .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
            .setApplicationId(1)
            .setAppVersion("1.0")
            .initialize();
        
        // Create UI
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        
        EditText licenseInput = new EditText(this);
        licenseInput.setHint("License Key");
        
        Button loginBtn = new Button(this);
        loginBtn.setText("Login");
        loginBtn.setOnClickListener(v -> {
            String key = licenseInput.getText().toString();
            validateAndLogin(key);
        });
        
        layout.addView(licenseInput);
        layout.addView(loginBtn);
        setContentView(layout);
    }
    
    private void validateAndLogin(String licenseKey) {
        auth.validateLicense(licenseKey, new Auth.AuthCallback() {
            @Override
            public void onSuccess(Auth.AuthResponse response) {
                Toast.makeText(MainActivity.this, 
                    "Welcome! Expires in " + response.getDaysRemaining() + " days", 
                    Toast.LENGTH_LONG).show();
                
                // Continue to app
                startActivity(new Intent(MainActivity.this, MenuActivity.class));
                finish();
            }
            
            @Override
            public void onError(String error) {
                Toast.makeText(MainActivity.this, 
                    "Login failed: " + error, 
                    Toast.LENGTH_LONG).show();
            }
        });
    }
}
```

---

### Example 2: Session Management

```java
public class SessionManager {
    private SharedPreferences prefs;
    private Context context;
    
    public SessionManager(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences("AdiCheats", Context.MODE_PRIVATE);
    }
    
    // Save session
    public void saveSession(Auth.AuthResponse response) {
        prefs.edit()
            .putBoolean("logged_in", true)
            .putString("license_key", response.licenseKey)
            .putString("expires_at", response.expiresAt)
            .putInt("days_remaining", response.getDaysRemaining())
            .putBoolean("hwid_locked", response.hwidLockEnabled)
            .putLong("login_time", System.currentTimeMillis())
            .apply();
    }
    
    // Check if logged in
    public boolean isLoggedIn() {
        return prefs.getBoolean("logged_in", false);
    }
    
    // Get days remaining
    public int getDaysRemaining() {
        return prefs.getInt("days_remaining", 0);
    }
    
    // Logout
    public void logout() {
        prefs.edit().clear().apply();
    }
}
```

**Usage:**
```java
SessionManager session = new SessionManager(context);

// After successful login
session.saveSession(response);

// Check if logged in
if (session.isLoggedIn()) {
    // Continue to app
} else {
    // Show login screen
}

// Logout
session.logout();
```

---

### Example 3: Auto Re-validation

```java
public class AutoValidator {
    private Auth auth;
    private SessionManager session;
    private Handler handler = new Handler(Looper.getMainLooper());
    
    public AutoValidator(Context context, Auth auth, SessionManager session) {
        this.auth = auth;
        this.session = session;
    }
    
    // Re-validate every 24 hours
    public void startAutoValidation() {
        Runnable validationTask = new Runnable() {
            @Override
            public void run() {
                String licenseKey = session.getLicenseKey();
                
                if (licenseKey != null) {
                    auth.validateLicense(licenseKey, new Auth.AuthCallback() {
                        @Override
                        public void onSuccess(Auth.AuthResponse response) {
                            // Update session
                            session.saveSession(response);
                            
                            // Schedule next validation
                            handler.postDelayed(this, 24 * 60 * 60 * 1000); // 24 hours
                        }
                        
                        @Override
                        public void onError(String error) {
                            // License invalid, logout user
                            session.logout();
                        }
                    });
                }
            }
        };
        
        // Start validation
        handler.post(validationTask);
    }
}
```

---

### Example 4: Offline Mode

```java
public class OfflineValidator {
    private SessionManager session;
    
    public boolean canUseOffline() {
        if (!session.isLoggedIn()) {
            return false;
        }
        
        // Check if last validation was within 7 days
        long lastValidation = session.getLastValidationTime();
        long now = System.currentTimeMillis();
        long daysSince = (now - lastValidation) / (1000 * 60 * 60 * 24);
        
        return daysSince < 7;
    }
    
    public void validateOrUseOffline(String licenseKey, Auth auth, 
                                     Auth.AuthCallback callback) {
        // Try online validation
        auth.validateLicense(licenseKey, new Auth.AuthCallback() {
            @Override
            public void onSuccess(Auth.AuthResponse response) {
                session.saveSession(response);
                session.updateLastValidation();
                callback.onSuccess(response);
            }
            
            @Override
            public void onError(String error) {
                // If network error and offline mode allowed, use cached session
                if (error.startsWith("Network error:") && canUseOffline()) {
                    Auth.AuthResponse cachedResponse = session.getCachedResponse();
                    callback.onSuccess(cachedResponse);
                } else {
                    callback.onError(error);
                }
            }
        });
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. NetworkOnMainThreadException

**Error:**
```
android.os.NetworkOnMainThreadException
```

**Solution:**
The `Auth.validateLicense()` method already runs on a background thread. Make sure you're not calling it from a custom thread that blocks the main thread.

---

#### 2. JSON Parsing Error

**Error:**
```
Invalid server response: org.json.JSONException
```

**Solution:**
- Check that your API URL is correct
- Verify the API is returning valid JSON
- Check server logs for errors

---

#### 3. HWID Always Changes

**Error:**
HWID is different every time the app runs.

**Solution:**
- Ensure you're testing on a real device, not multiple emulators
- Check that Android ID is available (should not be null)
- For emulators, HWID may change between restarts

---

#### 4. Connection Timeout

**Error:**
```
Network error: connect timed out
```

**Solution:**
- Check internet connection
- Verify API URL is correct and accessible
- Increase timeout values in `Auth.java` (lines with `setConnectTimeout` and `setReadTimeout`)

---

#### 5. Invalid License Key

**Error:**
```
INVALID_LICENSE: Invalid license key
```

**Solution:**
- Verify the license key is correct
- Check that the license belongs to your application ID
- Ensure the license is not expired or banned
- Verify the application ID matches your dashboard

---

### Debug Mode

Enable detailed logging:

```java
// In Auth.java, all logs use tag "AdiAuth"
// Filter logcat:
adb logcat -s AdiAuth
```

**Example output:**
```
D/AdiAuth: Auth initialized
D/AdiAuth: API URL: https://adicheats.auth.kesug.com/api/v1
D/AdiAuth: HWID: 9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A0B9C8D7E6F5A4B3C2D1E0F9A8B
D/AdiAuth: Validating license key: AIMKILL-ABC123-XYZ789
D/AdiAuth: Endpoint: https://adicheats.auth.kesug.com/api/v1/license/validate
D/AdiAuth: Response code: 200
D/AdiAuth: ✓ License validation successful!
D/AdiAuth: License expires: 2025-12-31T23:59:59.999Z
D/AdiAuth: HWID locked: true
```

---

### Testing

#### Test with Valid License

```java
// Use a real license key from your dashboard
String testKey = "AIMKILL-VVQNTP-2PYMC2-90WQOL";

auth.validateLicense(testKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        Log.d("Test", "✓ Success!");
        Log.d("Test", "Expires: " + response.getFormattedExpiryDate());
        Log.d("Test", "Days: " + response.getDaysRemaining());
        Log.d("Test", "HWID Lock: " + response.hwidLockEnabled);
    }
    
    @Override
    public void onError(String error) {
        Log.e("Test", "✗ Error: " + error);
    }
});
```

#### Test with Invalid License

```java
String invalidKey = "INVALID-KEY-12345";

auth.validateLicense(invalidKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        Log.e("Test", "Should not succeed!");
    }
    
    @Override
    public void onError(String error) {
        Log.d("Test", "✓ Correctly detected invalid license");
        assert error.startsWith("INVALID_LICENSE:");
    }
});
```

---

## 📝 Best Practices

### 1. Always Initialize Before Use

```java
// ✓ GOOD
auth = new Auth(context)
    .setApiUrl(API_URL)
    .setApplicationId(APP_ID)
    .setAppVersion(VERSION)
    .initialize();

// ✗ BAD
auth = new Auth(context);
auth.validateLicense(...); // Missing configuration!
```

---

### 2. Save Session After Validation

```java
@Override
public void onSuccess(AuthResponse response) {
    // Save session first
    saveSession(response);
    
    // Then continue
    continueToApp();
}
```

---

### 3. Handle All Error Types

```java
@Override
public void onError(String error) {
    // Don't just show generic error
    // Handle each type specifically
    if (error.startsWith("LICENSE_EXPIRED:")) {
        showRenewalDialog();
    } else if (error.startsWith("HWID_MISMATCH:")) {
        showHwidResetDialog();
    }
    // ... etc
}
```

---

### 4. Validate Periodically

```java
// Re-validate every 24 hours to check for:
// - License expiration
// - Ban status changes
// - HWID changes

private void scheduleRevalidation() {
    handler.postDelayed(() -> {
        auth.validateLicense(savedLicenseKey, callback);
    }, 24 * 60 * 60 * 1000);
}
```

---

### 5. Show Expiry Warnings

```java
if (response.getDaysRemaining() < 7) {
    new AlertDialog.Builder(context)
        .setTitle("License Expiring Soon")
        .setMessage("Your license expires in " + 
                   response.getDaysRemaining() + " days.")
        .setPositiveButton("Renew Now", ...)
        .setNegativeButton("Remind Me Later", ...)
        .show();
}
```

---

## 🎯 Complete Integration Example

Here's a complete example showing everything together:

```java
public class MainActivity extends Activity {
    private Auth auth;
    private SessionManager session;
    private static final String API_URL = "https://adicheats.auth.kesug.com/api/v1";
    private static final int APP_ID = 1;
    private static final String VERSION = "1.0";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize
        auth = new Auth(this)
            .setApiUrl(API_URL)
            .setApplicationId(APP_ID)
            .setAppVersion(VERSION)
            .initialize();
        
        session = new SessionManager(this);
        
        // Check session
        if (session.isLoggedIn()) {
            // Re-validate in background
            revalidateSession();
        } else {
            showLoginScreen();
        }
    }
    
    private void showLoginScreen() {
        // Use LoginExample.java or your custom UI
        new LoginExample(this);
    }
    
    private void revalidateSession() {
        String licenseKey = session.getLicenseKey();
        
        auth.validateLicense(licenseKey, new Auth.AuthCallback() {
            @Override
            public void onSuccess(Auth.AuthResponse response) {
                session.saveSession(response);
                continueToApp(response);
            }
            
            @Override
            public void onError(String error) {
                session.logout();
                showLoginScreen();
            }
        });
    }
    
    private void continueToApp(Auth.AuthResponse response) {
        // Check expiry warning
        if (response.getDaysRemaining() < 7) {
            showExpiryWarning(response.getDaysRemaining());
        }
        
        // Launch main menu
        Intent intent = new Intent(this, MenuActivity.class);
        intent.putExtra("license_key", response.licenseKey);
        intent.putExtra("days_remaining", response.getDaysRemaining());
        startActivity(intent);
        finish();
    }
}
```

---

## 📞 Support

For issues or questions:

- **Discord**: https://discord.gg/qEUP6rzCYV
- **Dashboard**: https://adicheats.auth.kesug.com

---

## 📄 License

Created by Adi for AdiCheats  
© 2025 AdiCheats. All rights reserved.

---

**🎉 You're all set! Happy coding!**

