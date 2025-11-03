package com.projectvb;

import android.content.Context;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Random;

/**
 * License Authentication System
 * 
 * Validates license keys with your auth server.
 * Uses embedded application data in License.json for validation.
 * 
 * Usage:
 *   Auth auth = new Auth(context);
 *   auth.setApiUrl("https://adicheats.auth.kesug.com/api/v1")
 *       .setApiKey("your-api-key")
 *       .setAppVersion("1.0")
 *       .initialize();
 *   
 *   auth.validateLicense("YOUR-LICENSE-KEY", new Auth.AuthCallback() {
 *       @Override
 *       public void onSuccess(AuthResponse response) {
 *           // License valid!
 *       }
 *       
 *       @Override
 *       public void onError(String error) {
 *           // License invalid
 *       }
 *   });
 */
public class Auth {
    private static final String TAG = "AdiAuth";
    
    // API Configuration
    private String apiUrl = "https://adicheats.auth.kesug.com/api/v1";
    private String apiKey = "";
    private String appVersion = "";
    private Context context;
    private String hwid;

    /**
     * Constructor - Initialize with Android context
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
        Log.d(TAG, "Auth initialized. HWID: " + hwid);
    }

    /**
     * Set API base URL
     */
    public Auth setApiUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("API URL cannot be null or empty");
        }
        this.apiUrl = url;
        return this;
    }

    /**
     * Set API Key (get from your dashboard > Applications)
     */
    public Auth setApiKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("API Key cannot be null or empty");
        }
        this.apiKey = key;
        return this;
    }

    /**
     * Set App Version
     */
    public Auth setAppVersion(String version) {
        if (version == null || version.trim().isEmpty()) {
            throw new IllegalArgumentException("App Version cannot be null or empty");
        }
        this.appVersion = version;
        return this;
    }

    /**
     * Initialize - validates configuration
     */
    public Auth initialize() {
        if (apiUrl == null || apiUrl.isEmpty()) {
            throw new IllegalStateException("API URL required. Call setApiUrl() first");
        }
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("API Key required. Call setApiKey() first");
        }
        if (appVersion == null || appVersion.isEmpty()) {
            throw new IllegalStateException("App Version required. Call setAppVersion() first");
        }
        Log.d(TAG, "Auth initialized successfully");
        return this;
    }

    /**
     * Validate license key
     * 
     * @param licenseKey The license key to validate
     * @param callback Success/error callback
     */
    public void validateLicense(final String licenseKey, final AuthCallback callback) {
        if (licenseKey == null || licenseKey.trim().isEmpty()) {
            if (callback != null) {
                callback.onError("License key cannot be empty");
            }
            return;
        }
        if (callback == null) {
            throw new IllegalArgumentException("Callback cannot be null");
        }
        if (apiUrl == null || apiUrl.isEmpty()) {
            callback.onError("Auth not initialized. Call initialize() first");
            return;
        }
        if (apiKey == null || apiKey.isEmpty()) {
            callback.onError("API Key not set");
            return;
        }
        if (hwid == null || hwid.isEmpty()) {
            callback.onError("HWID generation failed");
            return;
        }

        new Thread(() -> {
            HttpURLConnection conn = null;
            BufferedReader reader = null;
            try {
                Log.d(TAG, "Validating license: " + licenseKey);
                
                String endpoint = apiUrl + "/license/validate";
                URL url = new URL(endpoint);
                
                JSONObject requestBody = new JSONObject();
                requestBody.put("licenseKey", licenseKey);
                requestBody.put("hwid", hwid);
                String requestBodyString = requestBody.toString();

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

                DataOutputStream os = new DataOutputStream(conn.getOutputStream());
                os.writeBytes(requestBodyString);
                os.flush();
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Response code: " + responseCode);

                try {
                    if (responseCode >= 200 && responseCode < 300) {
                        reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                    } else {
                        if (conn.getErrorStream() != null) {
                            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
                        } else {
                            callback.onError("Server error " + responseCode);
                            return;
                        }
                    }

                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    String responseBody = response.toString();
                    Log.d(TAG, "Response: " + responseBody);

                    if (responseBody.trim().isEmpty()) {
                        callback.onError("Empty response from server");
                        return;
                    }

                    JSONObject jsonResponse;
                    try {
                        jsonResponse = new JSONObject(responseBody);
                    } catch (JSONException e) {
                        callback.onError("Invalid server response");
                        return;
                    }

                    if (responseCode >= 200 && responseCode < 300) {
                        boolean success = jsonResponse.optBoolean("success", false);

                        if (success && jsonResponse.has("license")) {
                            JSONObject licenseData = jsonResponse.getJSONObject("license");

                            AuthResponse authResponse = new AuthResponse();
                            authResponse.success = true;
                            authResponse.message = jsonResponse.optString("message", "License validated");
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
                            
                            // Parse embedded application data
                            if (licenseData.has("applicationData")) {
                                JSONObject appData = licenseData.getJSONObject("applicationData");
                                authResponse.applicationName = appData.optString("name", "");
                                authResponse.applicationVersion = appData.optString("version", "");
                            }

                            Log.d(TAG, "✓ License validated successfully!");
                            callback.onSuccess(authResponse);
                        } else {
                            String errorMsg = jsonResponse.optString("message", "Validation failed");
                            callback.onError(errorMsg);
                        }
                    } else {
                        String errorMsg = jsonResponse.optString("message", "Unknown error");
                        
                        if (responseCode == 401 || errorMsg.toLowerCase().contains("unauthorized")) {
                            Log.e(TAG, "❌ AUTHENTICATION FAILED: Invalid API key");
                            callback.onError(
                                "⚠️ AUTHENTICATION FAILED\n\n" +
                                "Your API key is invalid.\n\n" +
                                "SOLUTION:\n" +
                                "1. Login to dashboard\n" +
                                "2. Go to Applications\n" +
                                "3. Copy the correct API key\n" +
                                "4. Update LoginExample.java"
                            );
                        } else {
                            callback.onError(errorMsg);
                        }
                    }
                } finally {
                    if (reader != null) {
                        try { reader.close(); } catch (Exception ignored) {}
                    }
                }

            } catch (java.net.UnknownHostException e) {
                Log.e(TAG, "Network error: Cannot reach server");
                callback.onError("Network error: Cannot reach server. Check your internet connection");
            } catch (java.net.SocketTimeoutException e) {
                Log.e(TAG, "Network error: Timeout");
                callback.onError("Network error: Connection timeout");
            } catch (java.io.IOException e) {
                Log.e(TAG, "Network error: " + e.getMessage());
                callback.onError("Network error: " + e.getMessage());
            } catch (JSONException e) {
                Log.e(TAG, "Data error: " + e.getMessage());
                callback.onError("Data error: " + e.getMessage());
            } catch (Exception e) {
                Log.e(TAG, "Error: " + e.getMessage());
                callback.onError("Error: " + e.getMessage());
            } finally {
                if (conn != null) {
                    try { conn.disconnect(); } catch (Exception ignored) {}
                }
            }
        }).start();
    }

    /**
     * Generate Hardware ID for device
     */
    private String generateHWID() {
        try {
            String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            
            String manufacturer = android.os.Build.MANUFACTURER != null ? android.os.Build.MANUFACTURER : "";
            String model = android.os.Build.MODEL != null ? android.os.Build.MODEL : "";
            String device = android.os.Build.DEVICE != null ? android.os.Build.DEVICE : "";
            String board = android.os.Build.BOARD != null ? android.os.Build.BOARD : "";
            String brand = android.os.Build.BRAND != null ? android.os.Build.BRAND : "";
            
            if (androidId != null && !androidId.isEmpty() && !androidId.equals("9774d56d682e549c")) {
                String combined = androidId + manufacturer + model + device + board + brand;
                return sha256(combined);
            }
            
            long timestamp = System.currentTimeMillis();
            Random random = new Random();
            String fallback = timestamp + "-" + random.nextInt(999999) + "-" + 
                            manufacturer + model + device;
            return sha256(fallback);
            
        } catch (Exception e) {
            Log.e(TAG, "HWID generation error: " + e.getMessage());
            return sha256(String.valueOf(System.currentTimeMillis() + new Random().nextInt(999999)));
        }
    }

    /**
     * SHA-256 hash function
     */
    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(input.hashCode());
        }
    }

    /**
     * Get current HWID
     */
    public String getHWID() {
        return hwid;
    }

    /**
     * Callback interface for validation
     */
    public interface AuthCallback {
        void onSuccess(AuthResponse response);
        void onError(String error);
    }

    /**
     * Response class with license data
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
        public String applicationName;
        public String applicationVersion;

        /**
         * Check if license is expired
         */
        public boolean isExpired() {
            if (expiresAt == null || expiresAt.isEmpty()) return false;
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                Date expiryDate = sdf.parse(expiresAt);
                return new Date().after(expiryDate);
            } catch (Exception e) {
                return false;
            }
        }

        /**
         * Get days remaining until expiration
         */
        public long getDaysRemaining() {
            if (expiresAt == null || expiresAt.isEmpty()) return 0;
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                Date expiryDate = sdf.parse(expiresAt);
                long diff = expiryDate.getTime() - new Date().getTime();
                return diff / (1000 * 60 * 60 * 24);
            } catch (Exception e) {
                return 0;
            }
        }

        /**
         * Get formatted expiration date
         */
        public String getFormattedExpiry() {
            if (expiresAt == null || expiresAt.isEmpty()) return "Never";
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                Date expiryDate = sdf.parse(expiresAt);
                SimpleDateFormat displayFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.US);
                return displayFormat.format(expiryDate);
            } catch (Exception e) {
                return expiresAt;
            }
        }
    }
}
