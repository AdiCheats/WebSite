/**
 * AdiCheats C++ Authentication - Login Example
 * 
 * This example demonstrates how to integrate the AdiCheats authentication
 * system into your C++ application with a login button.
 * 
 * This example shows THREE different ways to use the auth system:
 * 1. Console-based login (for testing)
 * 2. ImGui button integration (for GUI applications)
 * 3. Windows Forms button integration (for Win32 applications)
 */

#include "auth.hpp"
#include <iostream>
#include <string>
#include <thread>
#include <atomic>

// ========================================
// EXAMPLE 1: Simple Console Login
// ========================================

void console_login_example() {
    std::cout << "========================================" << std::endl;
    std::cout << "  AdiCheats Authentication System" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << std::endl;

    // Optional: Initialize (not required, but recommended)
    auto init_response = g_Auth.setup();
    if (!init_response.success) {
        std::cerr << "Initialization Error: " << init_response.message << std::endl;
        std::cout << "\nPlease configure your API key and URL in auth.hpp" << std::endl;
        return;
    }

    std::cout << "System initialized successfully!" << std::endl;
    std::cout << "API URL: " << g_Auth.GetAPIUrl() << std::endl;
    std::cout << "Version: " << g_Auth.GetVersion() << std::endl;
    std::cout << "HWID: " << g_Auth.GetHWID() << std::endl;
    std::cout << std::endl;

    // Get login credentials
    std::string username;
    std::string password;

    std::cout << "Username: ";
    std::getline(std::cin, username);

    std::cout << "Password: ";
    std::getline(std::cin, password);

    std::cout << "\nAuthenticating..." << std::endl;

    // Perform login
    auto response = g_Auth.Login(username, password);

    if (response.success) {
        std::cout << "\n✓ LOGIN SUCCESSFUL!" << std::endl;
        std::cout << "========================================" << std::endl;
        std::cout << "User ID: " << response.user_id << std::endl;
        std::cout << "Username: " << response.username << std::endl;
        
        if (!response.email.empty()) {
            std::cout << "Email: " << response.email << std::endl;
        }
        
        if (!response.expires_at.empty()) {
            std::cout << "Expires At: " << response.expires_at << std::endl;
        }
        
        if (response.hwid_locked) {
            std::cout << "HWID Lock: Enabled" << std::endl;
        }
        
        std::cout << "========================================" << std::endl;
        std::cout << "\nYou can now access the application!" << std::endl;
    } else {
        std::cout << "\n✗ LOGIN FAILED" << std::endl;
        std::cout << "========================================" << std::endl;
        std::cout << "Error: " << response.message << std::endl;
        
        // Check for version mismatch
        if (!response.required_version.empty()) {
            std::cout << "\nVersion Mismatch Detected!" << std::endl;
            std::cout << "Required Version: " << response.required_version << std::endl;
            std::cout << "Your Version: " << response.current_version << std::endl;
            std::cout << "Please update your application." << std::endl;
        }
        
        std::cout << "========================================" << std::endl;
    }
}

// ========================================
// EXAMPLE 2: ImGui Button Integration
// ========================================

/*
 * This example shows how to integrate authentication into ImGui applications
 * 
 * Usage in your ImGui render loop:
 * 
 * ```cpp
 * static std::string usernameInput(100, '\0');
 * static std::string passwordInput(100, '\0');
 * static bool loginInProgress = false;
 * static bool auth_error = false;
 * static std::string error_msg;
 * static c_auth::Response login_response;
 * 
 * ImGui::Begin("Login");
 * 
 * ImGui::InputText("Username", &usernameInput[0], usernameInput.size());
 * ImGui::InputText("Password", &passwordInput[0], passwordInput.size(), ImGuiInputTextFlags_Password);
 * 
 * if (ImGui::Button("Login", ImVec2(120, 40))) {
 *     loginInProgress = true;
 *     auth_error = false;
 *     error_msg.clear();
 * 
 *     std::string username = usernameInput.c_str();
 *     std::string password = passwordInput.c_str();
 * 
 *     // Perform login in separate thread to avoid blocking UI
 *     std::thread([username, password, &loginInProgress, &auth_error, &error_msg, &login_response]() {
 *         login_response = g_Auth.Login(username, password);
 * 
 *         if (login_response.success) {
 *             // Login successful - you can now access the application
 *             // Store user data, change game state, etc.
 *             auth_error = false;
 *         } else {
 *             // Login failed - show error
 *             auth_error = true;
 *             error_msg = login_response.message;
 *         }
 * 
 *         loginInProgress = false;
 *     }).detach();
 * }
 * 
 * if (loginInProgress) {
 *     ImGui::Text("Logging in...");
 * }
 * 
 * if (auth_error) {
 *     ImGui::TextColored(ImVec4(1, 0, 0, 1), "Error: %s", error_msg.c_str());
 * }
 * 
 * if (!login_response.username.empty()) {
 *     ImGui::TextColored(ImVec4(0, 1, 0, 1), "Welcome, %s!", login_response.username.c_str());
 * }
 * 
 * ImGui::End();
 * ```
 */

void imgui_login_example_code() {
    // This is just example code - copy the code from the comment above
    // into your actual ImGui render function
    std::cout << "See source code for ImGui integration example" << std::endl;
}

// ========================================
// EXAMPLE 3: Windows Forms Button
// ========================================

/*
 * This example shows how to integrate authentication into Windows Forms
 * 
 * In your Form1.h or similar:
 * 
 * ```cpp
 * private: System::Void btnLogin_Click(System::Object^ sender, System::EventArgs^ e) {
 *     // Disable button during login
 *     this->btnLogin->Enabled = false;
 *     this->lblStatus->Text = "Logging in...";
 * 
 *     // Get credentials from textboxes
 *     std::string username = marshal_as<std::string>(this->txtUsername->Text);
 *     std::string password = marshal_as<std::string>(this->txtPassword->Text);
 * 
 *     // Perform login in background thread
 *     std::thread([this, username, password]() {
 *         auto response = g_Auth.Login(username, password);
 * 
 *         // Update UI on main thread (use Invoke)
 *         this->Invoke(gcnew Action<c_auth::Response^>(this, &Form1::HandleLoginResponse), response);
 *     }).detach();
 * }
 * 
 * private: void HandleLoginResponse(c_auth::Response response) {
 *     this->btnLogin->Enabled = true;
 * 
 *     if (response.success) {
 *         MessageBox::Show(
 *             "Welcome, " + gcnew String(response.username.c_str()) + "!",
 *             "Login Successful",
 *             MessageBoxButtons::OK,
 *             MessageBoxIcon::Information
 *         );
 * 
 *         // Navigate to main form or enable features
 *         this->Hide();
 *         MainForm^ mainForm = gcnew MainForm();
 *         mainForm->Show();
 *     } else {
 *         MessageBox::Show(
 *             gcnew String(response.message.c_str()),
 *             "Login Failed",
 *             MessageBoxButtons::OK,
 *             MessageBoxIcon::Error
 *         );
 *         this->lblStatus->Text = "Login failed";
 *     }
 * }
 * ```
 */

void winforms_login_example_code() {
    // This is just example code - see the comment above for full implementation
    std::cout << "See source code for Windows Forms integration example" << std::endl;
}

// ========================================
// EXAMPLE 4: Advanced - Session Verification
// ========================================

void session_verification_example() {
    std::cout << "\n========================================" << std::endl;
    std::cout << "  Session Verification Example" << std::endl;
    std::cout << "========================================" << std::endl;

    // First, login to get a user ID
    std::string username;
    std::string password;

    std::cout << "Username: ";
    std::getline(std::cin, username);

    std::cout << "Password: ";
    std::getline(std::cin, password);

    auto login_response = g_Auth.Login(username, password);

    if (login_response.success) {
        std::cout << "\nLogin successful! User ID: " << login_response.user_id << std::endl;
        
        // Now verify the session
        std::cout << "\nVerifying session..." << std::endl;
        auto verify_response = g_Auth.VerifySession(login_response.user_id);

        if (verify_response.success) {
            std::cout << "✓ Session is valid!" << std::endl;
            std::cout << "User: " << verify_response.username << std::endl;
            if (!verify_response.expires_at.empty()) {
                std::cout << "Expires: " << verify_response.expires_at << std::endl;
            }
        } else {
            std::cout << "✗ Session verification failed: " << verify_response.message << std::endl;
        }
    } else {
        std::cout << "Login failed: " << login_response.message << std::endl;
    }
}

// ========================================
// Main Entry Point
// ========================================

int main() {
    // Run the console login example
    console_login_example();

    // Uncomment to test session verification
    // session_verification_example();

    std::cout << "\nPress Enter to exit...";
    std::cin.get();

    return 0;
}

