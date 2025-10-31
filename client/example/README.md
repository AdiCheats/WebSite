# AdiCheats C++ Authentication Library

Complete C++ integration example for the AdiCheats authentication system using libcurl and nlohmann::json.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Integration Guide](#integration-guide)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ Simple username/password authentication
- ✅ Automatic hardware ID (HWID) generation and locking
- ✅ Version checking and validation
- ✅ Session verification
- ✅ Comprehensive error handling
- ✅ Thread-safe operations
- ✅ Easy integration with ImGui, Windows Forms, or console apps

## 📦 Requirements

### Dependencies

1. **libcurl** (included in `Curl/` folder)
   - Static library for HTTP requests
   - Already configured with required .lib files

2. **nlohmann::json** (included as `json.hpp`)
   - Header-only JSON library
   - No additional setup required

3. **Windows SDK**
   - For HWID generation (ATL Security)
   - Included with Visual Studio

### Compiler Requirements

- Visual Studio 2017 or later
- C++14 or higher
- Windows 7 or later

## 🚀 Quick Start

### Step 1: Configure Your Credentials

Open `auth.hpp` and update these lines (around line 39-42):

```cpp
const std::string api_url = ("https://your-actual-url.replit.dev/api/v1");
const std::string api_key = ("your-actual-api-key-here");
const std::string app_version = ("1.0.0");  // Your app version
```

**Where to find these values:**
1. **API URL**: Your AdiCheats dashboard → Application Settings → API URL
2. **API Key**: Your AdiCheats dashboard → Application Settings → API Key
3. **Version**: Set this to match the version in your AdiCheats app settings

### Step 2: Compile the Example

#### Using Visual Studio

1. Create a new C++ Console Application project
2. Add these files to your project:
   - `auth.hpp`
   - `login_example.cpp`
   - `json.hpp`
   - All files from `Curl/` folder

3. Project Properties:
   - **C/C++ → General → Additional Include Directories**: Add path to `Curl/` folder
   - **Linker → General → Additional Library Directories**: Add path to `Curl/` folder
   - **Linker → Input → Additional Dependencies**: Add:
     ```
     libcurl_a.lib
     ws2_32.lib
     Normaliz.lib
     Crypt32.lib
     Wldap32.lib
     ```

4. Build and run!

#### Using CMake

Create a `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.10)
project(AdiCheatsAuth)

set(CMAKE_CXX_STANDARD 14)

# Add include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/Curl)

# Add executable
add_executable(AdiCheatsAuth login_example.cpp)

# Link libraries
target_link_libraries(AdiCheatsAuth 
    ${CMAKE_CURRENT_SOURCE_DIR}/Curl/libcurl_a.lib
    ws2_32
    Normaliz
    Crypt32
    Wldap32
)
```

Then build:
```bash
mkdir build
cd build
cmake ..
cmake --build .
```

## ⚙️ Configuration

### API Configuration

Edit `auth.hpp` (lines 39-42):

```cpp
const std::string api_url = ("https://your-replit-url.replit.dev/api/v1");
const std::string api_key = ("your-api-key-here");
const std::string app_version = ("1.0.0");
```

### SSL Verification (Optional)

For testing or self-signed certificates, you can disable SSL verification in `auth.hpp` (around line 95):

```cpp
// Uncomment these lines to disable SSL verification
curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYPEER, 0L);
curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYHOST, 0L);
```

⚠️ **Warning**: Only disable SSL in development. Never in production!

## 📖 Usage Examples

### Example 1: Simple Console Login

```cpp
#include "auth.hpp"
#include <iostream>

int main() {
    // Initialize (optional but recommended)
    auto init = g_Auth.setup();
    if (!init.success) {
        std::cerr << "Init error: " << init.message << std::endl;
        return 1;
    }

    // Login
    auto response = g_Auth.Login("username", "password");
    
    if (response.success) {
        std::cout << "Welcome, " << response.username << "!" << std::endl;
        std::cout << "User ID: " << response.user_id << std::endl;
        std::cout << "Expires: " << response.expires_at << std::endl;
    } else {
        std::cout << "Login failed: " << response.message << std::endl;
    }

    return 0;
}
```

### Example 2: ImGui Integration

```cpp
#include "auth.hpp"
#include <imgui.h>
#include <thread>

// Global state
static char usernameInput[100] = "";
static char passwordInput[100] = "";
static bool loginInProgress = false;
static bool auth_error = false;
static std::string error_msg;
static c_auth::Response login_response;

void RenderLoginUI() {
    ImGui::Begin("AdiCheats Login");

    ImGui::InputText("Username", usernameInput, sizeof(usernameInput));
    ImGui::InputText("Password", passwordInput, sizeof(passwordInput), 
                     ImGuiInputTextFlags_Password);

    if (ImGui::Button("Login", ImVec2(120, 40)) && !loginInProgress) {
        loginInProgress = true;
        auth_error = false;
        error_msg.clear();

        std::string username = usernameInput;
        std::string password = passwordInput;

        // Login in background thread
        std::thread([username, password]() {
            login_response = g_Auth.Login(username, password);

            if (login_response.success) {
                // Success! Enable application features
                auth_error = false;
            } else {
                // Failed - show error
                auth_error = true;
                error_msg = login_response.message;
            }

            loginInProgress = false;
        }).detach();
    }

    if (loginInProgress) {
        ImGui::Text("Logging in...");
        ImGui::Spinner("##spinner", 15, 6, ImGui::GetColorU32(ImGuiCol_ButtonHovered));
    }

    if (auth_error) {
        ImGui::TextColored(ImVec4(1, 0, 0, 1), "Error: %s", error_msg.c_str());
    }

    if (!login_response.username.empty() && !auth_error) {
        ImGui::TextColored(ImVec4(0, 1, 0, 1), 
                          "Welcome, %s!", login_response.username.c_str());
    }

    ImGui::End();
}
```

### Example 3: Session Verification

```cpp
#include "auth.hpp"

void GameLoop(int userId) {
    while (true) {
        // Verify session every 5 minutes
        static auto lastCheck = std::chrono::system_clock::now();
        auto now = std::chrono::system_clock::now();
        
        if (std::chrono::duration_cast<std::chrono::minutes>(now - lastCheck).count() >= 5) {
            auto verify = g_Auth.VerifySession(userId);
            
            if (!verify.success) {
                // Session expired or invalid - kick user
                std::cout << "Session expired: " << verify.message << std::endl;
                ExitGame();
                break;
            }
            
            lastCheck = now;
        }

        // Game logic here...
        Sleep(16); // ~60 FPS
    }
}
```

## 📚 API Reference

### Class: `c_auth`

Main authentication class.

#### Methods

##### `setup()`
Initialize the authentication system (optional).

```cpp
auto response = g_Auth.setup();
if (response.success) {
    // Initialized successfully
}
```

**Returns**: `Response` structure

---

##### `Login(username, password)`
Authenticate a user with username and password.

```cpp
auto response = g_Auth.Login("myusername", "mypassword");
if (response.success) {
    // Login successful
    int userId = response.user_id;
    std::string username = response.username;
}
```

**Parameters**:
- `username` (string): User's username
- `password` (string): User's password

**Returns**: `Response` structure with:
- `success` (bool): Whether login succeeded
- `message` (string): Status message or error
- `user_id` (int): User's ID (if successful)
- `username` (string): Username (if successful)
- `email` (string): User's email (if available)
- `expires_at` (string): Account expiration date
- `hwid_locked` (bool): Whether HWID lock is enabled
- `required_version` (string): Required version (if mismatch)
- `current_version` (string): Current version (if mismatch)

---

##### `VerifySession(user_id)`
Verify that a user session is still valid.

```cpp
auto response = g_Auth.VerifySession(userId);
if (response.success) {
    // Session is valid
}
```

**Parameters**:
- `user_id` (int): User ID to verify

**Returns**: `Response` structure

---

##### `GetHWID()`
Get the current hardware ID.

```cpp
std::string hwid = g_Auth.GetHWID();
```

**Returns**: String containing the hardware ID

---

##### `GetAPIUrl()`
Get the configured API URL.

```cpp
std::string url = g_Auth.GetAPIUrl();
```

**Returns**: API URL string

---

##### `GetVersion()`
Get the configured application version.

```cpp
std::string version = g_Auth.GetVersion();
```

**Returns**: Version string

## 🔧 Integration Guide

### For ImGui Applications

1. Include `auth.hpp` in your main file
2. Call `g_Auth.setup()` during initialization
3. Create login UI using ImGui
4. Use threading for non-blocking login
5. Store `user_id` after successful login

See `login_example.cpp` for complete ImGui example.

### For Windows Forms Applications

1. Add `auth.hpp` to your project
2. Call `g_Auth.Login()` in button click handler
3. Use `Invoke()` to update UI from background thread
4. Show MessageBox or navigate to main form on success

See `login_example.cpp` for complete Windows Forms example.

### For Console Applications

1. Include `auth.hpp`
2. Call `g_Auth.Login()` directly (no threading needed)
3. Check `response.success` for result
4. Display user information or error message

See `login_example.cpp` for complete console example.

## 🐛 Troubleshooting

### "API key not configured" Error

**Solution**: Open `auth.hpp` and set your actual API key:
```cpp
const std::string api_key = ("your-actual-api-key-here");
```

### "Failed to initialize CURL" Error

**Solution**: Make sure libcurl libraries are properly linked:
- Check Project Properties → Linker → Input
- Ensure `libcurl_a.lib` is in Additional Dependencies
- Verify library path in Additional Library Directories

### "Network error" or Connection Issues

**Possible causes**:
1. **Firewall**: Allow your application through Windows Firewall
2. **SSL**: Try disabling SSL verification for testing (see Configuration)
3. **Wrong URL**: Verify your API URL in `auth.hpp`
4. **Network**: Check your internet connection

**Debug steps**:
```cpp
auto response = g_Auth.Login("user", "pass");
std::cout << "Response: " << response.message << std::endl;
```

### "Invalid credentials" Error

**Causes**:
1. Wrong username or password
2. Account is disabled in dashboard
3. Account has expired
4. User doesn't exist

**Solution**: Check your AdiCheats dashboard:
- Navigate to User Management
- Verify user exists and is active
- Check expiration date

### Version Mismatch Error

**Solution**: Update the version in `auth.hpp` to match your dashboard:
```cpp
const std::string app_version = ("1.0.0");  // Match dashboard version
```

### HWID Mismatch Error

**Cause**: User is trying to login from a different computer

**Solution**: In your AdiCheats dashboard:
1. Go to User Management
2. Find the user
3. Click "Reset HWID"
4. User can now login from new computer

## 📝 Notes

- **HWID Lock**: Automatically enabled if configured in dashboard
- **Threading**: Use threads for UI applications to prevent freezing
- **Error Handling**: Always check `response.success` before using data
- **Security**: Never hardcode passwords in source code
- **Updates**: Check for library updates regularly

## 🆘 Support

If you need help:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review example code in `login_example.cpp`
3. Contact AdiCheats support through your dashboard
4. Check API documentation at your dashboard

## 📄 License

This library is provided as-is for use with the AdiCheats authentication system.

---

**Made with ❤️ for AdiCheats Users**

