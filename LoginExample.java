package com.projectvb;

import android.content.Context;
import android.widget.Toast;

/**
 * Simple Login Example for License System
 * 
 * This class provides an easy way to use Auth.java for license validation.
 * 
 * SETUP:
 * 1. Login to: https://adicheats.auth.kesug.com
 * 2. Go to Applications > Your App
 * 3. Copy the API Key
 * 4. Update API_KEY below with your real API key
 * 
 * USAGE:
 *   LoginExample.login(
 *       this,
 *       "YOUR-LICENSE-KEY",
 *       response -> {
 *           // Success! License is valid
 *           Toast.makeText(context, "Licensed!", Toast.LENGTH_SHORT).show();
 *       },
 *       response -> {
 *           // Failed
 *           Toast.makeText(context, response.message, Toast.LENGTH_LONG).show();
 *       }
 *   );
 */
public class LoginExample {
    
    // ⚠️ CHANGE THIS! Get your API key from dashboard > Applications > Your App
    private static final String API_KEY = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6"; // Example: AimkillTest
    
    // These are correct, don't change
    private static final String API_URL = "https://adicheats.auth.kesug.com/api/v1";
    private static final String APP_VERSION = "1.0";
    
    /**
     * Validate a license key (simple method)
     *
     * @param context Your activity context
     * @param licenseKey The license key to validate
     * @param onSuccess Called when validation succeeds
     * @param onError Called when validation fails
     */
    public static void login(
            Context context, 
            String licenseKey,
            LoginCallback onSuccess,
            LoginCallback onError) {
        
        try {
            // Create and configure Auth
            Auth auth = new Auth(context);
            auth.setApiUrl(API_URL)
                .setApiKey(API_KEY)
                .setAppVersion(APP_VERSION)
                .initialize();
            
            // Validate license
            auth.validateLicense(licenseKey, new Auth.AuthCallback() {
                @Override
                public void onSuccess(Auth.AuthResponse response) {
                    if (onSuccess != null) {
                        onSuccess.onCallback(response);
                    }
                }
                
                @Override
                public void onError(String error) {
                    if (onError != null) {
                        Auth.AuthResponse errorResponse = new Auth.AuthResponse();
                        errorResponse.success = false;
                        errorResponse.message = error;
                        onError.onCallback(errorResponse);
                    }
                }
            });
            
        } catch (Exception e) {
            Toast.makeText(context, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            if (onError != null) {
                Auth.AuthResponse errorResponse = new Auth.AuthResponse();
                errorResponse.success = false;
                errorResponse.message = e.getMessage();
                onError.onCallback(errorResponse);
            }
        }
    }
    
    /**
     * Simple callback interface
     */
    public interface LoginCallback {
        void onCallback(Auth.AuthResponse response);
    }
}
