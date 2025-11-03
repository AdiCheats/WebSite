package com.adicheats;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * AdiCheats License Authentication System
 * 
 * This class handles license key validation with your auth API.
 * It supports HWID locking, expiration checking, and ban detection.
 * 
 * Author: Adi
 * Version: 2.0
 * Date: November 2025
 */
public class Auth {
    // API Configuration
    private String apiUrl = "https://adicheats.auth.kesug.com/api/v1";
    private String apiKey = "xYfG1ebdjPavaPTE8keR-nPbN78G3Uge"; // Your application API key
    private String appVersion = "1.0";
    
    // Context for Android operations
    private Context context;
    
    // HWID (Hardware ID) for device identification
    private String hwid;
    
    // UI Components for Login
    private EditText licenseKeyInput;
    private Button loginButton;
    private TextView statusText;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Session management
    private static final String PREFS_NAME = "AdiCheatsAuth";
    
    /**
     * Initialize Auth system
     * 
     * @param context Android context (required for HWID generation)
     * @throws IllegalArgumentException if context is null
     */
    public Auth(Context context) {
        if (context == null) {
            throw new IllegalArgumentException("Context cannot be null");
        }
        this.context = context;
        this.hwid = generateHWID();
        
        if (this.hwid == null || this.hwid.isEmpty()) {
            throw new IllegalStateException("Failed to generate HWID");
        }
    }
    
    /**
     * Set API base URL
     * 
     * @param url API base URL (e.g., "https://adicheats.auth.kesug.com/api/v1")
     * @return this for chaining
     * @throws IllegalArgumentException if URL is null or empty
     */
    public Auth setApiUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("API URL cannot be null or empty");
        }
        this.apiUrl = url.trim().endsWith("/") ? url.trim().substring(0, url.trim().length() - 1) : url.trim();
        return this;
    }
    
    /**
     * Set API Key
     * 
     * @param key Your application API key from the dashboard
     * @return this for chaining
     * @throws IllegalArgumentException if API key is null or empty
     */
    public Auth setApiKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("API Key cannot be null or empty");
        }
        this.apiKey = key.trim();
        return this;
    }
    
    /**
     * Set application version
     * 
     * @param version App version (e.g., "1.0")
     * @return this for chaining
     * @throws IllegalArgumentException if version is null or empty
     */
    public Auth setAppVersion(String version) {
        if (version == null || version.trim().isEmpty()) {
            throw new IllegalArgumentException("App version cannot be null or empty");
        }
        this.appVersion = version.trim();
        return this;
    }
    
    /**
     * Initialize the auth system (call after configuration)
     * Validates that API URL, API Key, and App Version are set
     * 
     * @return this for chaining
     */
    public Auth initialize() {
        // Validate configuration
        if (apiUrl == null || apiUrl.isEmpty()) {
            throw new IllegalStateException("API URL is required. Call setApiUrl() before initialize()");
        }
        
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("API Key is required. Call setApiKey() before initialize()");
        }
        
        if (appVersion == null || appVersion.isEmpty()) {
            throw new IllegalStateException("App Version is required. Call setAppVersion() before initialize()");
        }
        
        return this;
    }
    
    /**
     * Validate license key
     * 
     * @param licenseKey The license key to validate
     * @param callback Callback for async result
     * @throws IllegalArgumentException if licenseKey or callback is null
     */
    public void validateLicense(final String licenseKey, final AuthCallback callback) {
        // Validate input parameters
        if (licenseKey == null || licenseKey.trim().isEmpty()) {
            if (callback != null) {
                callback.onError("License key cannot be null or empty");
            }
            return;
        }
        
        if (callback == null) {
            throw new IllegalArgumentException("Callback cannot be null");
        }
        
        // Check if initialized
        if (apiUrl == null || apiUrl.isEmpty()) {
            callback.onError("Auth not initialized. Call initialize() first");
            return;
        }
        
        if (apiKey == null || apiKey.isEmpty()) {
            callback.onError("API Key not set. Call setApiKey() first");
            return;
        }
        
        if (hwid == null || hwid.isEmpty()) {
            callback.onError("HWID not generated. Device identification failed");
            return;
        }
        
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                // Build validation endpoint
                String endpoint = apiUrl + "/license/validate";
                URL url = new URL(endpoint);
                
                // Create request body
                JSONObject requestBody = new JSONObject();
                requestBody.put("licenseKey", licenseKey);
                requestBody.put("hwid", hwid);
                
                // Open connection
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("X-API-Key", apiKey);
                conn.setRequestProperty("User-Agent", "AdiCheats-Android/" + appVersion);
                conn.setDoOutput(true);
                conn.setDoInput(true);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);
                
                // Send request
                DataOutputStream os = new DataOutputStream(conn.getOutputStream());
                os.writeBytes(requestBody.toString());
                os.flush();
                os.close();
                
                // Get response code
                int responseCode = conn.getResponseCode();
                
                // Read response
                BufferedReader reader = null;
                try {
                    if (responseCode >= 200 && responseCode < 300) {
                        reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                    } else {
                        if (conn.getErrorStream() != null) {
                            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
                        } else {
                            callback.onError("Server returned error code " + responseCode + " with no error details");
                            return;
                        }
                    }
                    
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    
                    String responseBody = response.toString();
                    
                    // Parse response
                    if (responseBody.trim().isEmpty()) {
                        callback.onError("Empty response from server");
                        return;
                    }
                    
                    JSONObject jsonResponse;
                    try {
                        jsonResponse = new JSONObject(responseBody);
                    } catch (JSONException e) {
                        callback.onError("Invalid server response: " + e.getMessage());
                        return;
                    }
                    
                    // Check if request was successful
                    if (responseCode >= 200 && responseCode < 300) {
                        boolean success = jsonResponse.optBoolean("success", false);
                        
                        if (success && jsonResponse.has("license")) {
                            JSONObject licenseData = jsonResponse.getJSONObject("license");
                            
                            // Create response object
                            AuthResponse authResponse = new AuthResponse();
                            authResponse.success = true;
                            authResponse.message = jsonResponse.optString("message", "License validated successfully");
                            authResponse.licenseKey = licenseData.optString("licenseKey", licenseKey);
                            authResponse.applicationId = licenseData.optInt("applicationId", 0);
                            authResponse.maxUsers = licenseData.optInt("maxUsers", 1);
                            authResponse.currentUsers = licenseData.optInt("currentUsers", 0);
                            authResponse.validityDays = licenseData.optInt("validityDays", 30);
                            authResponse.expiresAt = licenseData.optString("expiresAt", "");
                            authResponse.isActive = licenseData.optBoolean("isActive", true);
                            authResponse.isBanned = licenseData.optBoolean("isBanned", false);
                            authResponse.hwid = licenseData.optString("hwid", null);
                            authResponse.hwidLockEnabled = licenseData.optBoolean("hwidLockEnabled", false);
                            authResponse.description = licenseData.optString("description", "");
                            
                            callback.onSuccess(authResponse);
                        } else {
                            String errorMsg = jsonResponse.optString("message", "License validation failed");
                            callback.onError(errorMsg);
                        }
                    } else {
                        // Handle error response
                        String errorMsg = jsonResponse.optString("message", "Unknown error");
                        
                        // Parse specific error types
                        if (errorMsg.toLowerCase().contains("expired")) {
                            callback.onError("LICENSE_EXPIRED: " + errorMsg);
                        } else if (errorMsg.toLowerCase().contains("banned") || errorMsg.toLowerCase().contains("ban")) {
                            callback.onError("LICENSE_BANNED: " + errorMsg);
                        } else if (errorMsg.toLowerCase().contains("hwid") || errorMsg.toLowerCase().contains("hardware")) {
                            callback.onError("HWID_MISMATCH: " + errorMsg);
                        } else if (errorMsg.toLowerCase().contains("invalid")) {
                            callback.onError("INVALID_LICENSE: " + errorMsg);
                        } else if (errorMsg.toLowerCase().contains("limit") || errorMsg.toLowerCase().contains("maximum")) {
                            callback.onError("USER_LIMIT_REACHED: " + errorMsg);
                        } else {
                            callback.onError(errorMsg);
                        }
                    }
                } finally {
                    if (reader != null) {
                        try {
                            reader.close();
                        } catch (Exception ignored) {}
                    }
                }
                
                if (conn != null) {
                    conn.disconnect();
                }
                
            } catch (java.net.UnknownHostException e) {
                callback.onError("Network error: Cannot reach server. Check your internet connection");
            } catch (java.net.SocketTimeoutException e) {
                callback.onError("Network error: Connection timeout. Server took too long to respond");
            } catch (java.io.IOException e) {
                callback.onError("Network error: " + e.getMessage());
            } catch (JSONException e) {
                callback.onError("Data error: Invalid response format - " + e.getMessage());
            } catch (Exception e) {
                callback.onError("Unexpected error: " + e.getMessage());
            } finally {
                if (conn != null) {
                    try {
                        conn.disconnect();
                    } catch (Exception ignored) {}
                }
            }
        }).start();
    }
    
    /**
     * Generate Hardware ID (HWID) for device identification
     * Uses Android ID + device information for unique identification
     * 
     * @return SHA-256 hash of device identifier
     */
    private String generateHWID() {
        try {
            // Try to get Android ID
            String androidId = null;
            try {
                androidId = Settings.Secure.getString(
                    context.getContentResolver(), 
                    Settings.Secure.ANDROID_ID
                );
            } catch (Exception e) {
                // Silently handle permission issues
            }
            
            // Fallback if Android ID is null, empty, or is the emulator ID
            if (androidId == null || androidId.isEmpty() || androidId.equals("9774d56d682e549c")) {
                androidId = "DEVICE_" + System.currentTimeMillis();
            }
            
            // Get device information with fallbacks
            String manufacturer = android.os.Build.MANUFACTURER != null ? android.os.Build.MANUFACTURER : "UNKNOWN_MFG";
            String model = android.os.Build.MODEL != null ? android.os.Build.MODEL : "UNKNOWN_MODEL";
            String device = android.os.Build.DEVICE != null ? android.os.Build.DEVICE : "UNKNOWN_DEVICE";
            String board = android.os.Build.BOARD != null ? android.os.Build.BOARD : "UNKNOWN_BOARD";
            String brand = android.os.Build.BRAND != null ? android.os.Build.BRAND : "UNKNOWN_BRAND";
            
            // Combine multiple device identifiers for better uniqueness
            String deviceInfo = androidId + 
                               manufacturer + 
                               model + 
                               device +
                               board +
                               brand;
            
            // Generate SHA-256 hash
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(deviceInfo.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String result = hexString.toString().toUpperCase();
            
            // Ensure HWID is not empty
            if (result.isEmpty()) {
                throw new IllegalStateException("Generated HWID is empty");
            }
            
            return result;
            
        } catch (Exception e) {
            // Multiple fallback methods
            try {
                // Fallback 1: Use timestamp + random values
                long timestamp = System.currentTimeMillis();
                int random = (int) (Math.random() * 1000000);
                String fallbackStr = "FALLBACK_" + timestamp + "_" + random;
                
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(fallbackStr.getBytes(StandardCharsets.UTF_8));
                
                StringBuilder hexString = new StringBuilder(hash.length * 2);
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) {
                        hexString.append('0');
                    }
                    hexString.append(hex);
                }
                
                return hexString.toString().toUpperCase();
            } catch (Exception e2) {
                // Final fallback: guaranteed unique ID
                return "HWID_" + System.currentTimeMillis() + "_" + ((int)(Math.random() * 999999));
            }
        }
    }
    
    /**
     * Get the current device HWID
     * 
     * @return Hardware ID
     */
    public String getHWID() {
        return hwid;
    }
    
    /**
     * Get API URL
     * 
     * @return API base URL
     */
    public String getApiUrl() {
        return apiUrl;
    }
    
    /**
     * Get app version
     * 
     * @return App version
     */
    public String getAppVersion() {
        return appVersion;
    }
    
    /**
     * Get API Key
     * 
     * @return API Key
     */
    public String getApiKey() {
        return apiKey;
    }
    
    /**
     * Auth Response class
     * Contains license validation result and license information
     */
    public static class AuthResponse {
        public boolean success;
        public String message;
        public String licenseKey;
        public int applicationId;
        public int maxUsers;
        public int currentUsers;
        public int validityDays;
        public String expiresAt;
        public boolean isActive;
        public boolean isBanned;
        public String hwid;
        public boolean hwidLockEnabled;
        public String description;
        
        /**
         * Check if license is expired
         * 
         * @return true if expired
         */
        public boolean isExpired() {
            if (expiresAt == null || expiresAt.isEmpty()) {
                return false;
            }
            
            try {
                // Parse ISO date string (e.g., "2025-12-31T23:59:59.999Z")
                // Remove milliseconds and Z if present
                String cleanDate = expiresAt.replace("Z", "").split("\\.")[0];
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
                sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                java.util.Date date = sdf.parse(cleanDate);
                long expiryTime = date.getTime();
                return System.currentTimeMillis() > expiryTime;
            } catch (Exception e) {
                return false;
            }
        }
        
        /**
         * Check if license is valid (active, not banned, not expired)
         * 
         * @return true if valid
         */
        public boolean isValid() {
            return success && isActive && !isBanned && !isExpired();
        }
        
        /**
         * Get days until expiration
         * 
         * @return days remaining (-1 if expired or error)
         */
        public int getDaysRemaining() {
            if (expiresAt == null || expiresAt.isEmpty()) {
                return validityDays;
            }
            
            try {
                // Parse ISO date string (e.g., "2025-12-31T23:59:59.999Z")
                String cleanDate = expiresAt.replace("Z", "").split("\\.")[0];
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
                sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                java.util.Date date = sdf.parse(cleanDate);
                long expiryTime = date.getTime();
                long currentTime = System.currentTimeMillis();
                long diff = expiryTime - currentTime;
                
                if (diff < 0) return -1;
                
                return (int) (diff / (1000 * 60 * 60 * 24));
            } catch (Exception e) {
                return validityDays;
            }
        }
        
        /**
         * Get formatted expiry date for display
         * 
         * @return formatted date string
         */
        public String getFormattedExpiryDate() {
            if (expiresAt == null || expiresAt.isEmpty()) {
                return "Unknown";
            }
            
            try {
                java.text.SimpleDateFormat inputFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
                java.text.SimpleDateFormat outputFormat = new java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.US);
                java.util.Date date = inputFormat.parse(expiresAt.replace("Z", "").split("\\.")[0]);
                return outputFormat.format(date);
            } catch (Exception e) {
                return expiresAt;
            }
        }
    }
    
    /**
     * Callback interface for async authentication
     */
    public interface AuthCallback {
        /**
         * Called when authentication succeeds
         * 
         * @param response Auth response with license details
         */
        void onSuccess(AuthResponse response);
        
        /**
         * Called when authentication fails
         * 
         * @param error Error message
         */
        void onError(String error);
    }
    
    /**
     * Show login UI and handle authentication flow
     * Call this method to display the login screen
     * 
     * @param apiUrl Your API URL (e.g., "https://adicheats.auth.kesug.com/api/v1")
     * @param apiKey Your API key from dashboard
     * @param appVersion Your app version (e.g., "1.0")
     * @param onLoginSuccess Callback when login succeeds - receives AuthResponse
     */
    public void showLogin(String apiUrl, String apiKey, String appVersion, LoginSuccessCallback onLoginSuccess) {
        // Configure Auth
        this.setApiUrl(apiUrl)
            .setApiKey(apiKey)
            .setAppVersion(appVersion)
            .initialize();
        
        // Check if already logged in
        if (isUserLoggedIn()) {
            showWelcomeAndContinue(onLoginSuccess);
        } else {
            createLoginUI(onLoginSuccess);
        }
    }
    
    /**
     * Create beautiful login UI
     */
    private void createLoginUI(LoginSuccessCallback onLoginSuccess) {
        if (!(context instanceof Activity)) {
            Toast.makeText(context, "Context must be an Activity", Toast.LENGTH_LONG).show();
            return;
        }
        
        Activity activity = (Activity) context;
        
        // Main container
        LinearLayout rootLayout = new LinearLayout(context);
        rootLayout.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setGravity(Gravity.CENTER);
        rootLayout.setBackgroundColor(Color.parseColor("#000000"));
        rootLayout.setPadding(40, 40, 40, 40);
        
        // Card container
        LinearLayout cardLayout = new LinearLayout(context);
        cardLayout.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        cardLayout.setOrientation(LinearLayout.VERTICAL);
        cardLayout.setGravity(Gravity.CENTER);
        cardLayout.setPadding(30, 30, 30, 30);
        
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(Color.parseColor("#1A1A1A"));
        cardBg.setCornerRadius(20f);
        cardBg.setStroke(2, Color.parseColor("#E50914"));
        cardLayout.setBackground(cardBg);
        
        // Title
        TextView title = new TextView(context);
        title.setText("AdiCheats");
        title.setTextSize(32);
        title.setTextColor(Color.parseColor("#E50914"));
        title.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        titleParams.setMargins(0, 0, 0, 30);
        title.setLayoutParams(titleParams);
        
        // Subtitle
        TextView subtitle = new TextView(context);
        subtitle.setText("License Authentication");
        subtitle.setTextSize(14);
        subtitle.setTextColor(Color.parseColor("#AAAAAA"));
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subtitleParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        subtitleParams.setMargins(0, 0, 0, 40);
        subtitle.setLayoutParams(subtitleParams);
        
        // License key input
        licenseKeyInput = new EditText(context);
        licenseKeyInput.setHint("Enter License Key");
        licenseKeyInput.setTextColor(Color.WHITE);
        licenseKeyInput.setHintTextColor(Color.parseColor("#666666"));
        licenseKeyInput.setPadding(20, 15, 20, 15);
        licenseKeyInput.setSingleLine(true);
        
        GradientDrawable inputBg = new GradientDrawable();
        inputBg.setColor(Color.parseColor("#0D0D0D"));
        inputBg.setCornerRadius(10f);
        inputBg.setStroke(1, Color.parseColor("#333333"));
        licenseKeyInput.setBackground(inputBg);
        
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        inputParams.setMargins(0, 0, 0, 20);
        licenseKeyInput.setLayoutParams(inputParams);
        
        // Status text
        statusText = new TextView(context);
        statusText.setText("");
        statusText.setTextSize(12);
        statusText.setTextColor(Color.parseColor("#AAAAAA"));
        statusText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        statusParams.setMargins(0, 0, 0, 20);
        statusText.setLayoutParams(statusParams);
        
        // Login button
        loginButton = new Button(context);
        loginButton.setText("LOGIN");
        loginButton.setTextColor(Color.WHITE);
        loginButton.setTextSize(16);
        
        GradientDrawable buttonBg = new GradientDrawable();
        buttonBg.setColor(Color.parseColor("#E50914"));
        buttonBg.setCornerRadius(10f);
        loginButton.setBackground(buttonBg);
        
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        buttonParams.setMargins(0, 0, 0, 20);
        loginButton.setLayoutParams(buttonParams);
        
        loginButton.setOnClickListener(v -> handleLogin(onLoginSuccess));
        
        // HWID display
        TextView hwidText = new TextView(context);
        String hwidDisplay = hwid != null && hwid.length() > 32 ? hwid.substring(0, 32) + "..." : hwid;
        hwidText.setText("Device HWID:\n" + hwidDisplay);
        hwidText.setTextSize(10);
        hwidText.setTextColor(Color.parseColor("#666666"));
        hwidText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams hwidParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        hwidParams.setMargins(0, 20, 0, 0);
        hwidText.setLayoutParams(hwidParams);
        
        // Copyright text
        TextView copyrightText = new TextView(context);
        copyrightText.setText("© AdiCheats 2025");
        copyrightText.setTextSize(10);
        copyrightText.setTextColor(Color.parseColor("#555555"));
        copyrightText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams copyrightParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        copyrightParams.setMargins(0, 20, 0, 0);
        copyrightText.setLayoutParams(copyrightParams);
        
        // Add all views
        cardLayout.addView(title);
        cardLayout.addView(subtitle);
        cardLayout.addView(licenseKeyInput);
        cardLayout.addView(statusText);
        cardLayout.addView(loginButton);
        cardLayout.addView(hwidText);
        cardLayout.addView(copyrightText);
        
        rootLayout.addView(cardLayout);
        
        // Set content view
        activity.setContentView(rootLayout);
    }
    
    /**
     * Handle login button click
     */
    private void handleLogin(LoginSuccessCallback onLoginSuccess) {
        String licenseKey = licenseKeyInput.getText().toString().trim();
        
        // Validate input
        if (licenseKey.isEmpty()) {
            Toast.makeText(context, "Please enter a license key", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // Disable input during login
        loginButton.setEnabled(false);
        loginButton.setText("VALIDATING...");
        licenseKeyInput.setEnabled(false);
        statusText.setText("Connecting to server...");
        statusText.setTextColor(Color.parseColor("#FFA500"));
        
        // Validate license
        validateLicense(licenseKey, new AuthCallback() {
            @Override
            public void onSuccess(AuthResponse response) {
                mainHandler.post(() -> {
                    // Save session
                    saveLicenseSession(response);
                    
                    // Update UI
                    statusText.setText("✓ License validated successfully!");
                    statusText.setTextColor(Color.parseColor("#00FF00"));
                    
                    // Show success dialog
                    showSuccessDialog(response, onLoginSuccess);
                });
            }
            
            @Override
            public void onError(String error) {
                mainHandler.post(() -> {
                    // Re-enable input
                    loginButton.setEnabled(true);
                    loginButton.setText("LOGIN");
                    licenseKeyInput.setEnabled(true);
                    statusText.setText("✗ Validation failed");
                    statusText.setTextColor(Color.parseColor("#FF0000"));
                    
                    // Handle specific error types
                    handleError(error);
                });
            }
        });
    }
    
    /**
     * Handle different error types with appropriate dialogs
     */
    private void handleError(String error) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        
        if (error.startsWith("LICENSE_EXPIRED:")) {
            builder.setTitle("License Expired")
                   .setMessage("Your license has expired. Please renew your subscription to continue using AdiCheats.")
                   .setPositiveButton("OK", null);
        } else if (error.startsWith("LICENSE_BANNED:")) {
            builder.setTitle("License Banned")
                   .setMessage("This license has been banned. Please contact the administrator for assistance.")
                   .setPositiveButton("OK", null);
        } else if (error.startsWith("HWID_MISMATCH:")) {
            String hwidDisplay = hwid != null && hwid.length() > 32 ? hwid.substring(0, 32) + "..." : hwid;
            builder.setTitle("Device Mismatch")
                   .setMessage("This license is locked to a different device.\n\nYour HWID: " + 
                              hwidDisplay + "\n\n" +
                              "Please contact the administrator to reset your HWID lock.")
                   .setPositiveButton("OK", null);
        } else if (error.startsWith("INVALID_LICENSE:")) {
            builder.setTitle("Invalid License")
                   .setMessage("The license key you entered is invalid. Please check and try again.")
                   .setPositiveButton("OK", null);
        } else if (error.startsWith("USER_LIMIT_REACHED:")) {
            builder.setTitle("User Limit Reached")
                   .setMessage("This license has reached its maximum user limit.")
                   .setPositiveButton("OK", null);
        } else {
            builder.setTitle("Authentication Error")
                   .setMessage("Error: " + error + "\n\nPlease try again or contact support if the problem persists.")
                   .setPositiveButton("Retry", (dialog, which) -> {
                       if (licenseKeyInput != null && loginButton != null) {
                           handleLogin(null);
                       }
                   })
                   .setNegativeButton("Cancel", null);
        }
        
        builder.show();
    }
    
    /**
     * Show success dialog with license info
     */
    private void showSuccessDialog(AuthResponse response, LoginSuccessCallback onLoginSuccess) {
        String message = "Welcome to AdiCheats!\n\n";
        if (response.licenseKey != null && response.licenseKey.length() > 16) {
            message += "License: " + response.licenseKey.substring(0, 16) + "...\n";
        } else {
            message += "License: " + response.licenseKey + "\n";
        }
        message += "Status: Active\n";
        message += "Expires: " + response.getFormattedExpiryDate() + "\n";
        message += "Days Remaining: " + response.getDaysRemaining() + "\n";
        
        if (response.hwidLockEnabled) {
            message += "\nHWID Lock: Enabled ✓";
        }
        
        if (response.description != null && !response.description.isEmpty()) {
            message += "\n\n" + response.description;
        }
        
        new AlertDialog.Builder(context)
            .setTitle("✓ Login Successful")
            .setMessage(message)
            .setPositiveButton("Continue", (dialog, which) -> {
                // Continue to main app
                continueToApp(response, onLoginSuccess);
            })
            .setNegativeButton("Logout", (dialog, which) -> {
                logout();
            })
            .setCancelable(false)
            .show();
    }
    
    /**
     * Continue to main application
     */
    private void continueToApp(AuthResponse response, LoginSuccessCallback onLoginSuccess) {
        Toast.makeText(context, 
            "Welcome! License expires in " + response.getDaysRemaining() + " days", 
            Toast.LENGTH_LONG
        ).show();
        
        // Call callback if provided
        if (onLoginSuccess != null) {
            onLoginSuccess.onSuccess(response);
        }
    }
    
    /**
     * Save license session to SharedPreferences
     */
    private void saveLicenseSession(AuthResponse response) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean("is_logged_in", true)
            .putString("license_key", response.licenseKey)
            .putString("expires_at", response.expiresAt)
            .putInt("days_remaining", response.getDaysRemaining())
            .putBoolean("hwid_locked", response.hwidLockEnabled)
            .putString("hwid", response.hwid != null ? response.hwid : "")
            .putLong("login_timestamp", System.currentTimeMillis())
            .apply();
    }
    
    /**
     * Check if user is already logged in
     */
    private boolean isUserLoggedIn() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean("is_logged_in", false);
    }
    
    /**
     * Show welcome message and continue if already logged in
     */
    private void showWelcomeAndContinue(LoginSuccessCallback onLoginSuccess) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String licenseKey = prefs.getString("license_key", "");
        int daysRemaining = prefs.getInt("days_remaining", 0);
        
        Toast.makeText(context, 
            "Welcome back! " + daysRemaining + " days remaining", 
            Toast.LENGTH_SHORT
        ).show();
        
        // Create a mock response from saved data
        AuthResponse savedResponse = new AuthResponse();
        savedResponse.success = true;
        savedResponse.licenseKey = licenseKey;
        savedResponse.expiresAt = prefs.getString("expires_at", "");
        savedResponse.hwidLockEnabled = prefs.getBoolean("hwid_locked", false);
        
        // Call callback if provided
        if (onLoginSuccess != null) {
            onLoginSuccess.onSuccess(savedResponse);
        }
    }
    
    /**
     * Logout and clear session
     */
    public void logout() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
        
        Toast.makeText(context, "Logged out successfully", Toast.LENGTH_SHORT).show();
        
        // Recreate login UI
        if (context instanceof Activity) {
            createLoginUI(null);
        }
    }
    
    /**
     * Callback interface for login success
     */
    public interface LoginSuccessCallback {
        /**
         * Called when login succeeds
         * 
         * @param response Auth response with license details
         */
        void onSuccess(AuthResponse response);
    }
}
