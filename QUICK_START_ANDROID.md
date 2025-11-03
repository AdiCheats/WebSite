# 🚀 Quick Start - AdiCheats Android Auth

## ⚡ Get Started in 5 Minutes

### Step 1: Copy Auth.java
Copy `Auth.java` to:
```
app/src/main/java/com/adicheats/auth/Auth.java
```

### Step 2: Add Permission to AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Step 3: Create LoginActivity.java
```java
package com.yourapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.adicheats.auth.Auth;

public class LoginActivity extends AppCompatActivity {
    private Auth auth;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize Auth
        auth = new Auth(this);
        auth.setApiUrl("https://your-url.replit.dev/api/v1")
            .setApiKey("your-api-key")
            .setAppVersion("1.0.0");
        
        // Setup login button
        EditText username = findViewById(R.id.username);
        EditText password = findViewById(R.id.password);
        Button loginBtn = findViewById(R.id.loginButton);
        
        loginBtn.setOnClickListener(v -> {
            String user = username.getText().toString();
            String pass = password.getText().toString();
            
            auth.login(user, pass, new Auth.AuthCallback() {
                @Override
                public void onSuccess(Auth.AuthResponse response) {
                    runOnUiThread(() -> {
                        Toast.makeText(LoginActivity.this, 
                            "Welcome " + response.getUsername(), 
                            Toast.LENGTH_SHORT).show();
                        // Go to main activity
                    });
                }
                
                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        Toast.makeText(LoginActivity.this, 
                            "Error: " + error, 
                            Toast.LENGTH_LONG).show();
                    });
                }
            });
        });
    }
}
```

### Step 4: Test!
Run your app and try logging in!

---

## 🎯 Key Features

✅ **Username/Password Login** - Standard authentication  
✅ **License Key Support** - Validate license keys  
✅ **HWID Locking** - Hardware-based security  
✅ **Version Checking** - Force updates  
✅ **Session Verification** - Keep users logged in  
✅ **Blacklist Support** - Block users/IPs/HWIDs  

---

## 📱 API Methods

### Login
```java
auth.login(username, password, callback);
```

### Login with License Key
```java
auth.loginWithLicenseKey(username, password, licenseKey, callback);
```

### Verify Session
```java
auth.verifySession(userId, callback);
```

### Check if Logged In
```java
boolean isLoggedIn = auth.isLoggedIn();
```

### Logout
```java
auth.logout();
```

### Get HWID
```java
String hwid = auth.getHWID();
```

---

## 🎨 Example Layout

Copy `activity_login_example.xml` to:
```
app/src/main/res/layout/activity_login.xml
```

The example layout includes:
- Username input
- Password input  
- License key input (optional)
- Login button
- Progress bar
- HWID display
- Modern material design

---

## ✅ Complete Checklist

- [ ] Copy Auth.java to project
- [ ] Add internet permission
- [ ] Set API URL and API Key
- [ ] Create LoginActivity
- [ ] Add layout XML
- [ ] Test login
- [ ] Test error handling
- [ ] Test on device

---

## 🐛 Common Issues

### "Network on Main Thread"
✅ Fixed! Auth.java handles threading automatically.

### "Cleartext Traffic"
Add to AndroidManifest.xml:
```xml
<application android:usesCleartextTraffic="true">
```

### "Connection Timeout"
Check your API URL and internet connection.

---

## 📚 Full Documentation

See `Auth_Android_Implementation.md` for:
- Complete examples
- Advanced features
- Troubleshooting guide
- Best practices

---

## 🎉 You're Ready!

Your Android app now has full AdiCheats authentication!

**Next Steps:**
1. Test with real users
2. Add session persistence
3. Implement auto-login
4. Deploy your app!

---

**Support:** See API_Documentation.md  
**Made by AdiCheats** ❤️

