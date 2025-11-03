package com.projectvb;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.PorterDuff;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.RippleDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.*;

import java.io.File;

public class Login {
    // API Configuration
    private static final String API_URL = "https://adicheats.auth.kesug.com/api/v1";
    private static final String API_KEY = "80Dlrivjtb9g8rC1idn9BJeVrxQ7iiE6";
    private static final String APP_VERSION = "1.0";

    private Context context;
    private Utils utils;
    private ImageString imageString;
    private int injectType;
    private EditText input_licenseKey;
    private Switch suToggle;
    private Auth auth;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public static Context globalContext;

    static {
        System.loadLibrary("hawdawdawdawda");
    }

    public Login(Context glob_Context) {
        Login.globalContext = glob_Context;
        context = glob_Context;
        utils = new Utils(context);
        imageString = new ImageString();
        
        // Initialize Auth with configuration (following LoginExample pattern)
        auth = new Auth(context);
        auth.setApiUrl(API_URL)
            .setApiKey(API_KEY)
            .setAppVersion(APP_VERSION)
            .initialize();
        
        Init();
    }

    @TargetApi(Build.VERSION_CODES.M)
    private void Init() {
        final String androidId = Settings.Secure.getString(
                context.getContentResolver(),
                Settings.Secure.ANDROID_ID
        );

        // ----------- ROOT CONTAINER ------------
        FrameLayout rootLayout = new FrameLayout(context);
        
        // Add pure black background to root layout
        GradientDrawable rootBackground = new GradientDrawable();
        rootBackground.setColor(0xFF000000); // pure dark black
        
        rootLayout.setBackground(rootBackground);
        ((Activity) context).setContentView(rootLayout);

        // ----------- LOGIN UI CONTAINER (fixed, no scrolling) ----------
        LinearLayout container = new LinearLayout(context);
        FrameLayout.LayoutParams containerParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        containerParams.gravity = Gravity.CENTER;
        container.setLayoutParams(containerParams);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setGravity(Gravity.CENTER);
        container.setPadding(30, 28, 30, 28);

        GradientDrawable gradient_container_login = new GradientDrawable();
        gradient_container_login.setCornerRadius(20);
        gradient_container_login.setColor(0xCC111111); // slightly lighter black panel
        gradient_container_login.setStroke(3, 0xFFE50914); // glowing red border look

        LinearLayout container_login = new LinearLayout(context);
        container_login.setLayoutParams(new LinearLayout.LayoutParams(585, ViewGroup.LayoutParams.WRAP_CONTENT));
        container_login.setOrientation(LinearLayout.VERTICAL);
        container_login.setGravity(Gravity.CENTER_HORIZONTAL);
        container_login.setBackground(gradient_container_login);
        container_login.setElevation(12f);
        container_login.setPadding(30, 22, 30, 22);

        GradientDrawable gradient_line_color = new GradientDrawable();
        gradient_line_color.setColor(0xFFFF0000); // Pure red
        gradient_line_color.setCornerRadii(new float[]{10, 10, 10, 10, 0, 0, 0, 0});

        LinearLayout line_color = new LinearLayout(context);
        line_color.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, utils.FixDP(8)));
        line_color.setBackground(gradient_line_color);

        LinearLayout container_top = new LinearLayout(context);
        container_top.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, utils.FixDP(60)));
        container_top.setGravity(Gravity.CENTER);
        container_top.setOrientation(LinearLayout.HORIZONTAL);

        TextView mvpCheatsText = new TextView(context);
        android.graphics.Typeface titleTypeface = null;
        try {
            titleTypeface = android.graphics.Typeface.createFromAsset(context.getAssets(), "fonts/Designer.otf");
        } catch (Exception ignored) {}
        SpannableString brandTitle = new SpannableString("Adi Cheats");
        brandTitle.setSpan(new ForegroundColorSpan(0xFFE50914), 0, 3, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        brandTitle.setSpan(new ForegroundColorSpan(0xFFFFFFFF), 3, brandTitle.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        mvpCheatsText.setText(brandTitle);
        mvpCheatsText.setTextSize(26);
        if (titleTypeface != null) {
            mvpCheatsText.setTypeface(titleTypeface);
        } else {
            mvpCheatsText.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        }
        mvpCheatsText.setTextColor(0xFFFFFFFF);
        mvpCheatsText.setShadowLayer(12, 0, 0, 0x55E50914); // subtle red glow
        mvpCheatsText.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout line_separator_1 = new LinearLayout(context);
        line_separator_1.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, utils.FixDP(2)));
        line_separator_1.setBackgroundColor(0xFF333333);

        LinearLayout container_center = new LinearLayout(context);
        container_center.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        container_center.setPadding(utils.FixDP(8), utils.FixDP(8), utils.FixDP(8), utils.FixDP(8));
        container_center.setOrientation(LinearLayout.VERTICAL);
        container_center.setGravity(Gravity.CENTER);

        GradientDrawable gradient_input = new GradientDrawable();
        gradient_input.setColor(0x00000000);
        gradient_input.setStroke(2, 0xFFFFFFFF); // White border
        gradient_input.setCornerRadius(10);

        LinearLayout.LayoutParams layoutParams_input = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, utils.FixDP(42));
        layoutParams_input.setMargins(0, utils.FixDP(10), 0, 0);

        // License key field with inline golden key icon
        input_licenseKey = new EditText(context);
        input_licenseKey.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, utils.FixDP(42)));
        input_licenseKey.setHint("Enter license key");
        input_licenseKey.setTextSize(14);
        input_licenseKey.setSingleLine();
        input_licenseKey.setPadding(utils.FixDP(10), 0, utils.FixDP(10), 0);
        input_licenseKey.setBackground(gradient_input);
        input_licenseKey.setTextColor(0xFFFFFFFF);
        input_licenseKey.setHintTextColor(0xFFBBBBBB); // light grey hint
        input_licenseKey.setShadowLayer(2, 0, 0, 0x66B0B0B0); // subtle light grey glow
        try {
            android.graphics.drawable.Drawable keyDrawable = context.getDrawable(android.R.drawable.ic_lock_lock);
            if (keyDrawable != null) {
                keyDrawable.setColorFilter(0xFFFFD700, PorterDuff.Mode.SRC_IN);
                input_licenseKey.setCompoundDrawablesWithIntrinsicBounds(keyDrawable, null, null, null);
                input_licenseKey.setCompoundDrawablePadding(utils.FixDP(8));
            }
        } catch (Exception ignored) {}

        suToggle = new Switch(context);
        suToggle.setText("ROOT BYPASS");
        suToggle.setTextColor(0xFFFFFFFF);
        suToggle.setTextSize(12);
        suToggle.setChecked(isSuRenamed());
        suToggle.setVisibility(Switch.VISIBLE);
        suToggle.setOnCheckedChangeListener((buttonView, isChecked) -> toggleSu(isChecked));

        LinearLayout.LayoutParams suToggleParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        suToggleParams.setMargins(0, utils.FixDP(10), 0, 0);
        suToggle.setLayoutParams(suToggleParams);
        // Improve visibility of unchecked state using distinct track/thumb tints
        try {
            int[][] states = new int[][]{
                    new int[]{android.R.attr.state_checked},
                    new int[]{}
            };
            // Checked: bright red thumb, deep red track
            // Unchecked: light red thumb, light red track so it stands out on black
            int[] thumbColors = new int[]{0xFFE50914, 0xFFFF8888};
            int[] trackColors = new int[]{0x77200000, 0x66FF6666};
            ColorStateList thumbTint = new ColorStateList(states, thumbColors);
            ColorStateList trackTint = new ColorStateList(states, trackColors);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                suToggle.setThumbTintList(thumbTint);
                suToggle.setTrackTintList(trackTint);
            }
        } catch (Exception ignored) {}

        GradientDrawable buttonBg = new GradientDrawable();
        buttonBg.setCornerRadius(utils.FixDP(10));
        buttonBg.setColors(new int[]{0xFFFF0000, 0xFFCC0000}); // Red gradient button
        buttonBg.setGradientType(GradientDrawable.LINEAR_GRADIENT);

        RippleDrawable rippleDrawable = new RippleDrawable(
                ColorStateList.valueOf(0xAAFFFFFF),
                buttonBg,
                null
        );

        Button login = new Button(context);
        LinearLayout.LayoutParams loginParams = new LinearLayout.LayoutParams(utils.FixDP(180), utils.FixDP(42));
        loginParams.setMargins(0, utils.FixDP(16), 0, 0);
        loginParams.gravity = Gravity.CENTER_HORIZONTAL;
        login.setLayoutParams(loginParams);
        login.setPadding(0, 0, 0, 0);
        login.setBackground(rippleDrawable);
        login.setText("LOGIN");
        login.setTextColor(0xFFFFFFFF);
        login.setTextSize(14);
        login.setShadowLayer(8, 0, 0, 0xFFFF0000); // Red shadow
        login.setOnClickListener(view -> {
            String enteredLicense = input_licenseKey.getText().toString().trim();

            if (enteredLicense.isEmpty()) {
                Toast.makeText(context, "Please enter license key", Toast.LENGTH_SHORT).show();
                return;
            }

            // Disable button during login
            login.setEnabled(false);
            login.setText("LOGGING IN...");

            // Default inject type: EMULATOR
            injectType = 1;

            performLicenseLogin(enteredLicense, injectType, login);
        });

        TextView copyright = new TextView(context);
        copyright.setPadding(0, utils.FixDP(8), 0, 0);
        copyright.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        copyright.setText("© ADI CHEATS  2025 - 2026");
        copyright.setTextColor(0xFFAAAAAA);
        copyright.setTextSize(12);

        // Add all views to layout
        container.addView(container_login);
        container_login.addView(container_top);
        container_top.addView(mvpCheatsText);
        container_login.addView(line_separator_1);
        container_login.addView(container_center);
        container_center.addView(input_licenseKey);
        container_center.addView(suToggle);
        container_login.addView(login);
        container.addView(copyright);

        rootLayout.addView(container);
        
        // Show welcome message
        Toast.makeText(context, "WELCOME TO ADI CHEATS", Toast.LENGTH_SHORT).show();
    }

    /**
     * Perform license key login using Auth.java
     * 
     * Follows the LoginExample pattern for proper Auth integration.
     * Uses Auth.validateLicense() to validate the license key with the server.
     * The validation checks:
     * - License key validity
     * - HWID locking
     * - Expiration status
     * - Ban status
     * - User limits
     */
    private void performLicenseLogin(final String licenseKey, final int injectType, final Button loginButton) {
        try {
            android.util.Log.d("AdiAuth", "========== LICENSE KEY LOGIN ATTEMPT ==========");
            android.util.Log.d("AdiAuth", "License Key: " + licenseKey.substring(0, Math.min(8, licenseKey.length())) + "...");
            android.util.Log.d("AdiAuth", "API URL: " + API_URL);
            android.util.Log.d("AdiAuth", "App Version: " + APP_VERSION);
            android.util.Log.d("AdiAuth", "HWID: " + auth.getHWID().substring(0, Math.min(16, auth.getHWID().length())) + "...");
            
            // Ensure Auth is properly configured (following LoginExample pattern)
            // Auth is already initialized in constructor, but we verify it's ready
            if (auth == null) {
                auth = new Auth(context);
                auth.setApiUrl(API_URL)
                    .setApiKey(API_KEY)
                    .setAppVersion(APP_VERSION)
                    .initialize();
            }
            
            // Validate license using Auth (following LoginExample pattern)
            auth.validateLicense(licenseKey, new Auth.AuthCallback() {
                @Override
                public void onSuccess(Auth.AuthResponse response) {
                    android.util.Log.d("AdiAuth", "✅ License validation successful!");
                    android.util.Log.d("AdiAuth", "License Key: " + (response.licenseKey != null ? response.licenseKey.substring(0, Math.min(8, response.licenseKey.length())) + "..." : "N/A"));
                    android.util.Log.d("AdiAuth", "Expires At: " + response.expiresAt);
                    android.util.Log.d("AdiAuth", "Is Active: " + response.isActive);
                    android.util.Log.d("AdiAuth", "Is Expired: " + response.isExpired());
                    android.util.Log.d("AdiAuth", "Days Remaining: " + response.getDaysRemaining());
                    
                    // Handle success on main thread
                    mainHandler.post(() -> {
                        // Re-enable login button
                        loginButton.setEnabled(true);
                        loginButton.setText("LOGIN");
                        
                        // Save user session
                        saveUserSession(response);
                        
                        // Show success dialog
                        String displayName = response.licenseKey != null && response.licenseKey.length() > 16 
                            ? response.licenseKey.substring(0, 16) + "..." 
                            : (response.licenseKey != null ? response.licenseKey : "User");
                        showOfficialSellerDialog(injectType, displayName, response);
                    });
                }

                @Override
                public void onError(String error) {
                    android.util.Log.e("AdiAuth", "❌ Login error: " + error);
                    
                    // Handle error on main thread
                    mainHandler.post(() -> {
                        // Re-enable login button
                        loginButton.setEnabled(true);
                        loginButton.setText("LOGIN");
                        
                        // Handle specific error types
                        handleLoginError(error);
                    });
                }
            });
            
        } catch (Exception e) {
            android.util.Log.e("AdiAuth", "Exception during login: " + e.getMessage(), e);
            mainHandler.post(() -> {
                // Re-enable login button
                loginButton.setEnabled(true);
                loginButton.setText("LOGIN");
                
                // Show error
                Toast.makeText(context, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
                handleLoginError("Error: " + e.getMessage());
            });
        }
    }

    /**
     * Handle different types of login errors with appropriate messages and actions
     */
    private void handleLoginError(String error) {
        android.util.Log.e("AdiAuth", "========== LOGIN ERROR ==========");
        android.util.Log.e("AdiAuth", "Error message: " + error);
        
        // Check for API key errors first (matching Auth.java error handling)
        if (error.contains("API_KEY_ERROR") || error.contains("api key")) {
            new AlertDialog.Builder(context)
                .setTitle("⚠️ API Key Error")
                .setMessage("API Key Authentication Failed!\n\n" +
                        "This means:\n" +
                        "• API key is invalid or incorrect\n" +
                        "• API key is not properly configured\n" +
                        "• API key doesn't exist in server database\n\n" +
                        "Solution:\n" +
                        "1. Verify your API key in Login.java (line 32)\n" +
                        "2. Check API key in your dashboard\n" +
                        "3. Make sure API key matches exactly (no spaces)\n" +
                        "4. Ensure application is Active in dashboard\n\n" +
                        "Error: " + error)
                .setPositiveButton("OK", null)
                .setNegativeButton("HELP", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .show();
            return;
        }
        
        // Check for unauthorized/authentication errors
        if (error.contains("Unauthorized") || error.contains("UNAUTHORIZED") || error.contains("401")) {
            new AlertDialog.Builder(context)
                .setTitle("⚠️ Authentication Failed")
                .setMessage("Unauthorized Access!\n\n" +
                        "This means:\n" +
                        "• API key is invalid or incorrect\n" +
                        "• API key is not properly configured\n" +
                        "• Server authentication failed\n\n" +
                        "Solution:\n" +
                        "1. Verify your API key in Auth.java\n" +
                        "2. Check API key in your dashboard\n" +
                        "3. Make sure API key matches exactly\n" +
                        "4. Contact support if issue persists\n\n" +
                        "Error: " + error)
                .setPositiveButton("OK", null)
                .setNegativeButton("HELP", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .show();
            return;
        }
        
        // Check for common issues
        if (error.contains("Invalid credentials") || error.contains("Invalid request data")) {
            // This usually means:
            // 1. User doesn't exist in database
            // 2. Username/password mismatch
            // 3. API key issue
            
            new AlertDialog.Builder(context)
                .setTitle("⚠️ Login Failed")
                .setMessage("Invalid Credentials!\n\n" +
                        "This means:\n" +
                        "• User doesn't exist in dashboard\n" +
                        "• License key not configured as username\n" +
                        "• Password doesn't match\n\n" +
                        "Solution:\n" +
                        "1. Go to your AdiCheats dashboard\n" +
                        "2. Create a user with:\n" +
                        "   Username = Your License Key\n" +
                        "   Password = Your License Key\n" +
                        "3. Make sure user is Active\n" +
                        "4. Try logging in again\n\n" +
                        "Error: " + error)
                .setPositiveButton("OK", null)
                .setNegativeButton("HELP", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .show();
            return;
        }
        
        if (error.contains("version") || error.contains("Version")) {
            // Version mismatch - show update dialog
            new AlertDialog.Builder(context)
                .setTitle("Update Required")
                .setMessage("Your app version is outdated. Please update to the latest version.\n\nError: " + error)
                .setPositiveButton("UPDATE", (dialog, which) -> {
                    // Open Play Store or update URL
                    String packageName = context.getPackageName();
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));
                    try {
                        context.startActivity(intent);
                    } catch (Exception e) {
                        // If Play Store not available, open in browser
                        intent.setData(Uri.parse("https://play.google.com/store/apps/details?id=" + packageName));
                        context.startActivity(intent);
                    }
                })
                .setNegativeButton("CANCEL", null)
                .setCancelable(false)
                .show();
        } else if (error.contains("blacklist") || error.contains("banned") || error.contains("blocked")) {
            // Account banned
            new AlertDialog.Builder(context)
                .setTitle("Access Denied")
                .setMessage("Your account has been blocked. Please contact support.")
                .setPositiveButton("CONTACT SUPPORT", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .setNegativeButton("OK", null)
                .show();
        } else if (error.contains("license") || error.contains("License")) {
            // Invalid license key
            Toast.makeText(context, "❌ Invalid License Key!\n" + error, Toast.LENGTH_LONG).show();
        } else if (error.contains("expired") || error.contains("Expired")) {
            // Expired license
            new AlertDialog.Builder(context)
                .setTitle("License Expired")
                .setMessage("Your license has expired. Please renew your subscription.")
                .setPositiveButton("JOIN DISCORD", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .setNegativeButton("OK", null)
                .show();
        } else if (error.contains("hwid") || error.contains("HWID") || error.contains("device")) {
            // HWID mismatch
            new AlertDialog.Builder(context)
                .setTitle("Device Mismatch")
                .setMessage("This license is locked to another device. Please contact support to reset your HWID.\n\nYour HWID: " + auth.getHWID().substring(0, 16) + "...")
                .setPositiveButton("CONTACT SUPPORT", (dialog, which) -> {
                    String discordUrl = "https://discord.gg/qEUP6rzCYV";
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
                    context.startActivity(intent);
                })
                .setNegativeButton("OK", null)
                .show();
        } else {
            // Generic error
            Toast.makeText(context, "Login Failed: " + error, Toast.LENGTH_LONG).show();
        }
    }

    /**
     * Save user session to SharedPreferences
     */
    private void saveUserSession(Auth.AuthResponse response) {
        SharedPreferences prefs = context.getSharedPreferences("AdiCheatsAuth", Context.MODE_PRIVATE);
        prefs.edit()
            .putString("license_key", response.licenseKey)
            .putString("expires_at", response.expiresAt)
            .putLong("days_remaining", response.getDaysRemaining())
            .putBoolean("hwid_locked", response.hwidLockEnabled)
            .putBoolean("is_active", response.isActive)
            .putBoolean("is_banned", response.isBanned)
            .putString("application_name", response.applicationName != null ? response.applicationName : "")
            .putString("application_version", response.applicationVersion != null ? response.applicationVersion : "")
            .putBoolean("is_logged_in", true)
            .putLong("login_timestamp", System.currentTimeMillis())
            .apply();
    }

    /**
     * Show official seller dialog after successful login
     */
    private void showOfficialSellerDialog(int injectType, String username, Auth.AuthResponse response) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle("Adi Cheats - Official Panel Provider");
        builder.setMessage("Developer: Adi (Verified Provider)");

        builder.setPositiveButton("JOIN DISCORD", (dialog, which) -> {
            String discordUrl = "https://discord.gg/qEUP6rzCYV";
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(discordUrl));
            context.startActivity(intent);
        });

        builder.setNegativeButton("CONTINUE", (dialog, which) -> {
            // Show welcome message with expiry date
            String welcomeMsg = "WELCOME TO ADICHEATS AIMKILL " + username;
            if (response.expiresAt != null && !response.expiresAt.isEmpty()) {
                long daysRemaining = response.getDaysRemaining();
                if (daysRemaining >= 0) {
                    welcomeMsg += "\n\nLicense expires in: " + daysRemaining + " days";
                } else {
                    welcomeMsg += "\n\nLicense expired";
                }
            }
            Toast.makeText(context, welcomeMsg, Toast.LENGTH_LONG).show();
            
            // Launch Menu
            new Menu(context, injectType);
            
            // Launch Free Fire
            final String PACKAGE = "com.dts.freefireth";
            PackageManager pm = context.getPackageManager();
            Intent intent = pm.getLaunchIntentForPackage(PACKAGE);

            if (intent != null) {
                intent.addCategory(Intent.CATEGORY_LAUNCHER);
                context.startActivity(intent);
            } else {
                context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + PACKAGE)));
            }

            suToggle.setVisibility(Switch.VISIBLE);
        });

        builder.setCancelable(false);
        builder.show();
    }

    private void toggleSu(boolean enable) {
        String from = enable ? "/system/xbin/su" : "/system/xbin/su1";
        String to = enable ? "/system/xbin/su1" : "/system/xbin/su";

        try {
            Process process = Runtime.getRuntime().exec(enable ? "su" : "su1");
            process.getOutputStream().write(("mount -o remount,rw /system\n").getBytes());
            process.getOutputStream().write(("mv " + from + " " + to + "\n").getBytes());
            process.getOutputStream().write("exit\n".getBytes());
            process.getOutputStream().flush();
            process.waitFor();
            Toast.makeText(context, "ROOT BYPASS " + (enable ? "ENABLED" : "DISABLED"), Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(context, "Root rename failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private boolean isSuRenamed() {
        return !new File("/system/xbin/su").exists();
    }
}
