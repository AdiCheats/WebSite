package com.projectvb;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

/**
 * Simple example showing how to use Auth.java in your app
 */
public class MainActivity_Example extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Example 1: Quick Login (recommended)
        quickLogin();
        
        // Example 2: With UI (if you want user to enter license)
        // setupLoginUI();
    }
    
    /**
     * Example 1: Quick login with hardcoded license
     * Use this if you give each user their own license key
     */
    private void quickLogin() {
        String myLicenseKey = "Aimkill-PY5WP0-Y8Z5TZ-TBHGCR"; // Your license here
        
        LoginExample.login(
            this,
            myLicenseKey,
            // Success callback
            response -> {
                Toast.makeText(this, 
                    "✓ Licensed!\n" +
                    "Expires in: " + response.getDaysRemaining() + " days", 
                    Toast.LENGTH_LONG).show();
                
                // Now continue to your main app
                startApp();
            },
            // Error callback
            response -> {
                Toast.makeText(this, 
                    "✗ License Error:\n" + response.message, 
                    Toast.LENGTH_LONG).show();
                
                // Close app or show error screen
                finish();
            }
        );
    }
    
    /**
     * Example 2: Login with UI (user enters license key)
     */
    private void setupLoginUI() {
        // Create simple UI
        setContentView(android.R.layout.activity_list_item);
        
        EditText licenseInput = new EditText(this);
        licenseInput.setHint("Enter License Key");
        
        Button loginButton = new Button(this);
        loginButton.setText("Activate");
        loginButton.setOnClickListener(v -> {
            String license = licenseInput.getText().toString();
            
            if (license.isEmpty()) {
                Toast.makeText(this, "Enter license key", Toast.LENGTH_SHORT).show();
                return;
            }
            
            LoginExample.login(
                this,
                license,
                response -> {
                    Toast.makeText(this, "✓ Success!", Toast.LENGTH_SHORT).show();
                    startApp();
                },
                response -> {
                    Toast.makeText(this, "✗ " + response.message, Toast.LENGTH_LONG).show();
                }
            );
        });
    }
    
    /**
     * Start your main app after successful login
     */
    private void startApp() {
        // Your app code here
        Toast.makeText(this, "Starting app...", Toast.LENGTH_SHORT).show();
    }
}

