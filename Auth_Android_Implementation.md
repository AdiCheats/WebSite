# 📱 AdiCheats Auth.java - Android Implementation Guide

## 🎯 Complete Integration Guide

This guide will help you integrate the AdiCheats authentication system into your Android Gradle application.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Usage](#basic-usage)
5. [Advanced Features](#advanced-features)
6. [Complete Example](#complete-example)
7. [Gradle Dependencies](#gradle-dependencies)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- **Android Studio** (latest version)
- **Min SDK:** API 21 (Android 5.0) or higher
- **Target SDK:** API 33 or higher
- **Gradle:** 7.0+
- **Java:** 8 or higher
- **Internet Permission** in AndroidManifest.xml

---

## 📦 Installation

### Step 1: Add Auth.java to Your Project

Copy `Auth.java` to your project:
```
YourProject/
└── app/
    └── src/
        └── main/
            └── java/
                └── com/
                    └── adicheats/
                        └── auth/
                            └── Auth.java
```

### Step 2: Add Internet Permission

Add to your `AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourapp">
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application>
        <!-- Your application code -->
    </application>
</manifest>
```

### Step 3: Add Dependencies to build.gradle

Add to your `app/build.gradle`:
```gradle
dependencies {
    // Required for JSON parsing
    implementation 'org.json:json:20230227'
    
    // Optional: For better networking (if you want to upgrade from HttpURLConnection)
    // implementation 'com.squareup.okhttp3:okhttp:4.11.0'
}
```

---

## ⚙️ Configuration

### Step 1: Get Your Credentials

1. Log into your AdiCheats dashboard
2. Navigate to your application
3. Copy your **API Key** and **API URL**

### Step 2: Initialize Auth in Your Activity

```java
package com.yourapp;

import android.os.Bundle;
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
        
        // Configure your credentials
        auth.setApiUrl("https://your-replit-url.replit.dev/api/v1")
            .setApiKey("your-api-key-here")
            .setAppVersion("1.0.0")
            .initialize();
    }
}
```

---

## 🚀 Basic Usage

### 1. Login with Username and Password

```java
EditText usernameInput = findViewById(R.id.username);
EditText passwordInput = findViewById(R.id.password);
Button loginButton = findViewById(R.id.loginButton);

loginButton.setOnClickListener(v -> {
    String username = usernameInput.getText().toString();
    String password = passwordInput.getText().toString();
    
    // Show loading
    showLoading();
    
    // Perform login
    auth.login(username, password, new Auth.AuthCallback() {
        @Override
        public void onSuccess(Auth.AuthResponse response) {
            runOnUiThread(() -> {
                hideLoading();
                // Login successful!
                Toast.makeText(LoginActivity.this, 
                    "Welcome, " + response.getUsername(), 
                    Toast.LENGTH_SHORT).show();
                
                // Navigate to main activity
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                intent.putExtra("user_id", response.getUserId());
                intent.putExtra("username", response.getUsername());
                startActivity(intent);
                finish();
            });
        }
        
        @Override
        public void onError(String error) {
            runOnUiThread(() -> {
                hideLoading();
                // Show error
                Toast.makeText(LoginActivity.this, 
                    "Login failed: " + error, 
                    Toast.LENGTH_LONG).show();
            });
        }
    });
});
```

### 2. Login with License Key

```java
EditText usernameInput = findViewById(R.id.username);
EditText passwordInput = findViewById(R.id.password);
EditText licenseKeyInput = findViewById(R.id.licenseKey);
Button loginButton = findViewById(R.id.loginButton);

loginButton.setOnClickListener(v -> {
    String username = usernameInput.getText().toString();
    String password = passwordInput.getText().toString();
    String licenseKey = licenseKeyInput.getText().toString();
    
    showLoading();
    
    auth.loginWithLicenseKey(username, password, licenseKey, new Auth.AuthCallback() {
        @Override
        public void onSuccess(Auth.AuthResponse response) {
            runOnUiThread(() -> {
                hideLoading();
                Toast.makeText(LoginActivity.this, 
                    "Login successful! License key validated.", 
                    Toast.LENGTH_SHORT).show();
                
                // Save session data
                saveUserData(response);
                
                // Navigate to main screen
                startMainActivity(response);
            });
        }
        
        @Override
        public void onError(String error) {
            runOnUiThread(() -> {
                hideLoading();
                if (error.contains("license")) {
                    Toast.makeText(LoginActivity.this, 
                        "Invalid license key!", 
                        Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(LoginActivity.this, 
                        "Error: " + error, 
                        Toast.LENGTH_LONG).show();
                }
            });
        }
    });
});
```

### 3. Verify Session

```java
// In MainActivity onCreate()
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    
    auth = new Auth(this);
    auth.setApiUrl("your-url")
        .setApiKey("your-key")
        .setAppVersion("1.0.0");
    
    // Get user ID from intent or SharedPreferences
    int userId = getIntent().getIntExtra("user_id", 0);
    
    if (userId > 0) {
        verifyUserSession(userId);
    } else {
        // No session, redirect to login
        redirectToLogin();
    }
}

private void verifyUserSession(int userId) {
    auth.verifySession(userId, new Auth.AuthCallback() {
        @Override
        public void onSuccess(Auth.AuthResponse response) {
            runOnUiThread(() -> {
                // Session valid, user can continue
                Toast.makeText(MainActivity.this, 
                    "Session verified", 
                    Toast.LENGTH_SHORT).show();
            });
        }
        
        @Override
        public void onError(String error) {
            runOnUiThread(() -> {
                // Session invalid, redirect to login
                Toast.makeText(MainActivity.this, 
                    "Session expired. Please login again.", 
                    Toast.LENGTH_LONG).show();
                redirectToLogin();
            });
        }
    });
}
```

---

## 🎯 Advanced Features

### 1. Save User Session with SharedPreferences

```java
private void saveUserData(Auth.AuthResponse response) {
    SharedPreferences prefs = getSharedPreferences("AdiCheatsAuth", MODE_PRIVATE);
    SharedPreferences.Editor editor = prefs.edit();
    
    editor.putInt("user_id", response.getUserId());
    editor.putString("username", response.getUsername());
    editor.putString("email", response.getEmail());
    editor.putString("expires_at", response.getExpiresAt());
    editor.putBoolean("is_logged_in", true);
    editor.apply();
}

private void clearUserData() {
    SharedPreferences prefs = getSharedPreferences("AdiCheatsAuth", MODE_PRIVATE);
    prefs.edit().clear().apply();
}

private boolean isUserLoggedIn() {
    SharedPreferences prefs = getSharedPreferences("AdiCheatsAuth", MODE_PRIVATE);
    return prefs.getBoolean("is_logged_in", false);
}
```

### 2. Handle Version Mismatch

```java
@Override
public void onError(String error) {
    runOnUiThread(() -> {
        if (error.contains("version")) {
            // Show update dialog
            new AlertDialog.Builder(LoginActivity.this)
                .setTitle("Update Required")
                .setMessage("Please update the app to the latest version.")
                .setPositiveButton("Update", (dialog, which) -> {
                    // Open Play Store
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setData(Uri.parse("market://details?id=" + getPackageName()));
                    startActivity(intent);
                })
                .setCancelable(false)
                .show();
        } else if (error.contains("blacklist")) {
            // Show banned dialog
            new AlertDialog.Builder(LoginActivity.this)
                .setTitle("Access Denied")
                .setMessage("Your account has been blocked.")
                .setPositiveButton("OK", null)
                .show();
        } else {
            Toast.makeText(LoginActivity.this, error, Toast.LENGTH_LONG).show();
        }
    });
}
```

### 3. Get Hardware ID

```java
String hwid = auth.getHWID();
Log.d("Auth", "Device HWID: " + hwid);

// Display HWID to user (for support purposes)
TextView hwidText = findViewById(R.id.hwidText);
hwidText.setText("Device ID: " + hwid.substring(0, 16) + "...");
```

### 4. Logout Function

```java
Button logoutButton = findViewById(R.id.logoutButton);
logoutButton.setOnClickListener(v -> {
    // Clear auth session
    auth.logout();
    
    // Clear saved data
    clearUserData();
    
    // Redirect to login
    Intent intent = new Intent(MainActivity.this, LoginActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    startActivity(intent);
    finish();
});
```

---

## 📝 Complete Example

### LoginActivity.java (Complete Implementation)

```java
package com.yourapp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.adicheats.auth.Auth;

public class LoginActivity extends AppCompatActivity {
    
    private Auth auth;
    private EditText usernameInput, passwordInput, licenseKeyInput;
    private Button loginButton;
    private ProgressBar progressBar;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Check if already logged in
        if (isUserLoggedIn()) {
            startMainActivity();
            return;
        }
        
        // Initialize views
        usernameInput = findViewById(R.id.username);
        passwordInput = findViewById(R.id.password);
        licenseKeyInput = findViewById(R.id.licenseKey);
        loginButton = findViewById(R.id.loginButton);
        progressBar = findViewById(R.id.progressBar);
        
        // Initialize Auth
        auth = new Auth(this);
        auth.setApiUrl("https://your-replit-url.replit.dev/api/v1")
            .setApiKey("your-api-key-here")
            .setAppVersion("1.0.0");
        
        // Setup login button
        loginButton.setOnClickListener(v -> performLogin());
    }
    
    private void performLogin() {
        String username = usernameInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();
        String licenseKey = licenseKeyInput.getText().toString().trim();
        
        // Validate inputs
        if (username.isEmpty()) {
            usernameInput.setError("Username required");
            return;
        }
        
        if (password.isEmpty()) {
            passwordInput.setError("Password required");
            return;
        }
        
        // Show loading
        showLoading(true);
        
        // Login with or without license key
        Auth.AuthCallback callback = new Auth.AuthCallback() {
            @Override
            public void onSuccess(Auth.AuthResponse response) {
                runOnUiThread(() -> {
                    showLoading(false);
                    
                    // Save user data
                    saveUserData(response);
                    
                    // Show success message
                    Toast.makeText(LoginActivity.this, 
                        "Welcome, " + response.getUsername() + "!", 
                        Toast.LENGTH_SHORT).show();
                    
                    // Navigate to main activity
                    startMainActivity();
                });
            }
            
            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    showLoading(false);
                    Toast.makeText(LoginActivity.this, 
                        "Login failed: " + error, 
                        Toast.LENGTH_LONG).show();
                });
            }
        };
        
        // Choose login method based on license key input
        if (!licenseKey.isEmpty()) {
            auth.loginWithLicenseKey(username, password, licenseKey, callback);
        } else {
            auth.login(username, password, callback);
        }
    }
    
    private void showLoading(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        loginButton.setEnabled(!show);
    }
    
    private void saveUserData(Auth.AuthResponse response) {
        SharedPreferences prefs = getSharedPreferences("AdiCheatsAuth", MODE_PRIVATE);
        prefs.edit()
            .putInt("user_id", response.getUserId())
            .putString("username", response.getUsername())
            .putString("email", response.getEmail())
            .putBoolean("is_logged_in", true)
            .apply();
    }
    
    private boolean isUserLoggedIn() {
        SharedPreferences prefs = getSharedPreferences("AdiCheatsAuth", MODE_PRIVATE);
        return prefs.getBoolean("is_logged_in", false);
    }
    
    private void startMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
```

---

## 🛠️ Gradle Dependencies

### app/build.gradle

```gradle
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.yourapp'
    compileSdk 33
    
    defaultConfig {
        applicationId "com.yourapp"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "1.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // JSON parsing (built-in, no extra dependency needed)
    // Android includes org.json by default
    
    // Optional: OkHttp for better networking
    // implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    
    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

---

## 🐛 Troubleshooting

### 1. Network on Main Thread Exception

**Problem:** `android.os.NetworkOnMainThreadException`

**Solution:** Auth.java already handles this! All network calls are performed on background threads. Make sure to use `runOnUiThread()` for UI updates in callbacks.

### 2. Cleartext Traffic Not Permitted

**Problem:** `java.net.UnknownServiceException: CLEARTEXT communication not supported`

**Solution:** Add to `AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true">
</application>
```

Or create `res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">your-replit-url.replit.dev</domain>
    </domain-config>
</network-security-config>
```

### 3. SSL Handshake Failed

**Problem:** `javax.net.ssl.SSLHandshakeException`

**Solution:** Make sure your API URL uses `https://` and has a valid SSL certificate.

### 4. Timeout Errors

**Problem:** `java.net.SocketTimeoutException`

**Solution:** Check your internet connection and API URL. The default timeout is 15 seconds.

---

## ✅ Testing Checklist

- [ ] Add Auth.java to project
- [ ] Add internet permission to manifest
- [ ] Configure API URL and API Key
- [ ] Test username/password login
- [ ] Test license key login
- [ ] Test session verification
- [ ] Test error handling
- [ ] Test logout functionality
- [ ] Test on physical device
- [ ] Test with slow internet connection

---

## 🎉 You're Done!

Your Android application now has complete AdiCheats authentication!

### Next Steps:
1. Create users in your AdiCheats dashboard
2. Test the login flow
3. Implement additional features (session persistence, auto-login, etc.)
4. Deploy your app!

---

## 📚 Additional Resources

- **AdiCheats Dashboard:** https://your-replit-url.replit.dev
- **API Documentation:** See `API_Documentation.md`
- **Support:** Contact AdiCheats support

---

**Made with ❤️ by AdiCheats**

