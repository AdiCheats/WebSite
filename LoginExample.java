package com.adicheats;

import android.app.Activity;
import android.content.Context;
import com.adicheats.Auth;

/**
 * Simple Login Example for AdiCheats License System
 * 
 * This is a simple wrapper that calls Auth.showLogin() with your credentials.
 * 
 * Author: Adi
 * Version: 2.0
 */
public class LoginExample {
    
    /**
     * Show login screen
     * Just provide your API URL, API Key, and App Version
     * 
     * @param context Your Activity context
     * @param apiUrl Your API URL (e.g., "https://adicheats.auth.kesug.com/api/v1")
     * @param apiKey Your API key from dashboard
     * @param appVersion Your app version (e.g., "1.0")
     * @param onLoginSuccess Callback when login succeeds (optional, can be null)
     */
    public static void showLogin(
            Context context, 
            String apiUrl, 
            String apiKey, 
            String appVersion,
            Auth.LoginSuccessCallback onLoginSuccess) {
        
        // Create Auth instance
        Auth auth = new Auth(context);
        
        // Show login UI with credentials
        auth.showLogin(apiUrl, apiKey, appVersion, onLoginSuccess);
    }
    
    /**
     * Simple login without callback
     * 
     * @param context Your Activity context
     * @param apiUrl Your API URL
     * @param apiKey Your API key
     * @param appVersion Your app version
     */
    public static void showLogin(
            Context context, 
            String apiUrl, 
            String apiKey, 
            String appVersion) {
        
        showLogin(context, apiUrl, apiKey, appVersion, null);
    }
}
