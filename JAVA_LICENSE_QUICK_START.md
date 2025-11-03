# 🚀 Java/Android License System - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Copy Files (30 seconds)

Copy to your project:
```
app/src/main/java/com/adicheats/
├── Auth.java           ← Main authentication class
└── LoginExample.java   ← Optional example
```

### Step 2: Add Permissions (30 seconds)

Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Step 3: Configuration (1 minute)

```java
// Get your API Key from the dashboard
// Go to: https://adicheats.auth.kesug.com → App Management
// Click on your app → Copy the API Key

Auth auth = new Auth(context)
    .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
    .setApiKey("YOUR-API-KEY-HERE") // ← Change to YOUR API Key!
    .setAppVersion("1.0")
    .initialize();
```

### Step 4: Validate License (2 minutes)

```java
String licenseKey = inputField.getText().toString();

auth.validateLicense(licenseKey, new Auth.AuthCallback() {
    @Override
    public void onSuccess(Auth.AuthResponse response) {
        // ✓ License is valid!
        Toast.makeText(context, "Welcome!", Toast.LENGTH_SHORT).show();
        
        // Save session
        saveToPreferences(response);
        
        // Continue to your app
        startActivity(new Intent(context, MainActivity.class));
    }
    
    @Override
    public void onError(String error) {
        // ✗ License is invalid
        Toast.makeText(context, "Error: " + error, Toast.LENGTH_LONG).show();
    }
});
```

### Step 5: Save Session (1 minute)

```java
private void saveToPreferences(Auth.AuthResponse response) {
    SharedPreferences prefs = getSharedPreferences("AdiCheats", MODE_PRIVATE);
    prefs.edit()
        .putBoolean("logged_in", true)
        .putString("license_key", response.licenseKey)
        .putString("expires_at", response.expiresAt)
        .putInt("days_remaining", response.getDaysRemaining())
        .apply();
}
```

---

## 🎯 Complete Minimal Example

Copy-paste this into your Activity:

```java
package com.adicheats;

import android.app.Activity;
import android.os.Bundle;
import android.widget.*;
import android.view.ViewGroup;
import com.adicheats.Auth;

public class LoginActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Auth
        Auth auth = new Auth(this)
            .setApiUrl("https://adicheats.auth.kesug.com/api/v1")
            .setApiKey("YOUR-API-KEY-HERE") // YOUR API KEY HERE!
            .setAppVersion("1.0")
            .initialize();
        
        // Create simple UI
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 50, 50, 50);
        
        EditText input = new EditText(this);
        input.setHint("Enter License Key");
        input.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        
        Button button = new Button(this);
        button.setText("Login");
        button.setOnClickListener(v -> {
            String key = input.getText().toString();
            
            auth.validateLicense(key, new Auth.AuthCallback() {
                @Override
                public void onSuccess(Auth.AuthResponse response) {
                    Toast.makeText(LoginActivity.this,
                        "Welcome! Expires in " + response.getDaysRemaining() + " days",
                        Toast.LENGTH_LONG).show();
                    
                    // TODO: Continue to your app
                }
                
                @Override
                public void onError(String error) {
                    Toast.makeText(LoginActivity.this,
                        "Error: " + error,
                        Toast.LENGTH_LONG).show();
                }
            });
        });
        
        layout.addView(input);
        layout.addView(button);
        setContentView(layout);
    }
}
```

---

## 📋 Checklist

Before testing:

- [ ] Copied `Auth.java` to your project
- [ ] Added internet permissions to manifest
- [ ] Changed package name if needed
- [ ] Set your API Key (from dashboard)
- [ ] Set your App Version
- [ ] Created a test license key in dashboard
- [ ] Added EditText for license input
- [ ] Added Button for login
- [ ] Implemented Auth.AuthCallback

---

## 🧪 Testing

### Test 1: Valid License

1. Go to dashboard → App Management
2. Create a new license key
3. Copy the license key
4. Paste in your app
5. Click Login
6. ✓ Should see success message

### Test 2: Invalid License

1. Enter "INVALID-KEY-12345"
2. Click Login
3. ✓ Should see error: "INVALID_LICENSE: Invalid license key"

### Test 3: HWID Lock

1. Create license with HWID lock enabled
2. First login on Device A: ✓ Success
3. Try same key on Device B: ✗ Should fail with HWID_MISMATCH

---

## 🔍 Debugging

Enable logging:
```bash
adb logcat -s AdiAuth
```

You should see:
```
D/AdiAuth: Auth initialized
D/AdiAuth: API URL: https://adicheats.auth.kesug.com/api/v1
D/AdiAuth: Application ID: 1
D/AdiAuth: App Version: 1.0
D/AdiAuth: Device HWID: 9A8B7C6D...
D/AdiAuth: Validating license key: AIMKILL-...
D/AdiAuth: Response code: 200
D/AdiAuth: ✓ License validation successful!
```

---

## 🚨 Common Errors

### Error: "Network error"
**Fix:** Check internet connection and API URL

### Error: "INVALID_LICENSE"
**Fix:** Verify license key is correct and belongs to your app

### Error: "HWID_MISMATCH"
**Fix:** License is locked to another device, reset HWID in dashboard

### Error: "LICENSE_EXPIRED"
**Fix:** License has expired, renew or create new one

---

## 🎨 Using the Example UI

For a beautiful login screen, use `LoginExample.java`:

```java
// In your Activity
new LoginExample(this);
```

That's it! It handles everything:
- ✓ Beautiful UI
- ✓ Error handling
- ✓ Session management
- ✓ Success dialogs

---

## 📱 Response Data

After successful login:

```java
Auth.AuthResponse response;

response.licenseKey        // "AIMKILL-ABC123-XYZ789"
response.expiresAt         // "2025-12-31T23:59:59.999Z"
response.getDaysRemaining() // 365
response.isValid()         // true
response.hwidLockEnabled   // true/false
response.maxUsers          // 1
response.currentUsers      // 0
```

---

## 🔐 Security Tips

1. **Don't hardcode license keys** in your app
2. **Validate on every app start** or periodically
3. **Save session** to avoid re-login every time
4. **Re-validate periodically** (e.g., every 24 hours)
5. **Handle offline mode** for poor connections

---

## 📚 Next Steps

1. ✅ Basic integration (this guide)
2. 📖 Read full documentation: `AUTH_JAVA_COMPLETE_GUIDE.md`
3. 🎨 Customize UI to match your app
4. 💾 Implement session management
5. 🔄 Add periodic re-validation
6. 📱 Test on real devices

---

## 📞 Need Help?

- **Discord**: https://discord.gg/qEUP6rzCYV
- **Dashboard**: https://adicheats.auth.kesug.com
- **Full Docs**: `AUTH_JAVA_COMPLETE_GUIDE.md`

---

**🎉 That's it! Your license system is ready to use!**

Just change the API Key and you're good to go! 🚀

