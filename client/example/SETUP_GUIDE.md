# 🚀 AdiCheats C++ Authentication - Quick Setup Guide

Get up and running in 5 minutes!

## ⚡ Quick Setup (5 steps)

### Step 1: Get Your Credentials

1. Log into your AdiCheats dashboard
2. Navigate to **Applications** → Select your app → **Settings**
3. Copy these values:
   - **API URL** (e.g., `https://yourusername-yourproject.replit.dev/api/v1`)
   - **API Key** (long string like `sk_live_abc123...`)
   - **Version** (e.g., `1.0.0`)

### Step 2: Configure auth.hpp

Open `auth.hpp` and find lines 39-42:

```cpp
// BEFORE (default):
const std::string api_url = ("https://your-replit-url.replit.dev/api/v1");
const std::string api_key = ("your-api-key-here");
const std::string app_version = ("1.0.0");

// AFTER (your actual values):
const std::string api_url = ("https://yourusername-yourproject.replit.dev/api/v1");
const std::string api_key = ("sk_live_abc123xyz789...");
const std::string app_version = ("1.0.0");
```

### Step 3: Build the Project

#### Option A: Visual Studio (Recommended for Windows)

1. Open Visual Studio
2. Create new **Console Application** project
3. Add these files to project:
   - `auth.hpp`
   - `login_example.cpp`
   - `json.hpp`
   - All files from `Curl/` folder

4. Configure project:
   - Right-click project → **Properties**
   - **C/C++** → **General** → **Additional Include Directories**
     - Add: `$(ProjectDir)Curl`
   
   - **Linker** → **General** → **Additional Library Directories**
     - Add: `$(ProjectDir)Curl`
   
   - **Linker** → **Input** → **Additional Dependencies**
     - Add at the beginning:
       ```
       libcurl_a.lib;ws2_32.lib;Normaliz.lib;Crypt32.lib;Wldap32.lib;
       ```

5. Press **F5** to build and run!

#### Option B: CMake (Cross-platform)

```bash
mkdir build
cd build
cmake ..
cmake --build .
.\bin\AdiCheatsAuth.exe
```

### Step 4: Test Login

Run the compiled executable. You'll see:

```
========================================
  AdiCheats Authentication System
========================================

System initialized successfully!
API URL: https://yourusername-yourproject.replit.dev/api/v1
Version: 1.0.0
HWID: S-1-5-21-...

Username: _
```

Enter a test username and password from your AdiCheats dashboard.

### Step 5: Integrate into Your App

Choose your integration method:

#### For ImGui Applications

Copy this into your ImGui render function:

```cpp
#include "auth.hpp"
#include <thread>

// At the top of your file (global or class member):
static char usernameInput[100] = "";
static char passwordInput[100] = "";
static bool loginInProgress = false;
static c_auth::Response loginResponse;

// In your ImGui render function:
void RenderLogin() {
    ImGui::Begin("Login");
    
    ImGui::InputText("Username", usernameInput, 100);
    ImGui::InputText("Password", passwordInput, 100, ImGuiInputTextFlags_Password);
    
    if (ImGui::Button("Login", ImVec2(120, 40)) && !loginInProgress) {
        loginInProgress = true;
        
        std::string user = usernameInput;
        std::string pass = passwordInput;
        
        std::thread([user, pass]() {
            loginResponse = g_Auth.Login(user, pass);
            loginInProgress = false;
        }).detach();
    }
    
    if (loginInProgress) {
        ImGui::Text("Logging in...");
    }
    
    if (!loginResponse.message.empty()) {
        if (loginResponse.success) {
            ImGui::TextColored(ImVec4(0,1,0,1), "Welcome, %s!", loginResponse.username.c_str());
        } else {
            ImGui::TextColored(ImVec4(1,0,0,1), "Error: %s", loginResponse.message.c_str());
        }
    }
    
    ImGui::End();
}
```

#### For Console Applications

```cpp
#include "auth.hpp"
#include <iostream>

int main() {
    g_Auth.setup();
    
    std::string username, password;
    std::cout << "Username: ";
    std::cin >> username;
    std::cout << "Password: ";
    std::cin >> password;
    
    auto response = g_Auth.Login(username, password);
    
    if (response.success) {
        std::cout << "Welcome, " << response.username << "!" << std::endl;
        // Continue with your application
    } else {
        std::cout << "Login failed: " << response.message << std::endl;
        return 1;
    }
    
    return 0;
}
```

## 🎯 Common Issues & Fixes

### ❌ "API key not configured"

**Fix**: Update `auth.hpp` lines 39-42 with your actual credentials

### ❌ "Failed to initialize CURL"

**Fix**: Make sure you linked the libraries correctly:
1. Project Properties → Linker → Input → Additional Dependencies
2. Add: `libcurl_a.lib;ws2_32.lib;Normaliz.lib;Crypt32.lib;Wldap32.lib;`

### ❌ "Unresolved external symbol" errors

**Fix**: Add include directory:
1. Project Properties → C/C++ → General → Additional Include Directories
2. Add: `$(ProjectDir)Curl`

### ❌ "Invalid credentials" but credentials are correct

**Possible causes**:
1. **User is disabled** - Check dashboard → User Management
2. **Account expired** - Check user's expiration date
3. **Wrong API key** - Verify API key matches dashboard

### ❌ Connection timeout or network errors

**Fixes**:
1. Check your internet connection
2. Verify API URL is correct in `auth.hpp`
3. Try disabling SSL verification temporarily (development only):
   ```cpp
   // In auth.hpp, uncomment these lines (around line 95):
   curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYPEER, 0L);
   curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYHOST, 0L);
   ```

## 📚 Next Steps

1. **Add users** to your application via the AdiCheats dashboard
2. **Test login** with different users
3. **Implement features** based on user authentication
4. **Add session verification** for longer sessions
5. **Handle errors** gracefully in your UI

## 🔐 Security Best Practices

1. ✅ **Never commit API keys** to git/GitHub
   - Add `auth.hpp` to `.gitignore` after configuration
   - Or use environment variables

2. ✅ **Enable SSL verification** in production
   - Only disable for local testing

3. ✅ **Use HWID locking** for sensitive applications
   - Enable in dashboard → Application Settings

4. ✅ **Implement session verification**
   - Check every 5-10 minutes using `VerifySession()`

5. ✅ **Clear sensitive data** after use
   - Don't store passwords in memory longer than needed

## 📖 Full Documentation

For complete API reference and advanced features, see:
- `README.md` - Complete documentation
- `login_example.cpp` - All usage examples
- AdiCheats Dashboard - Web-based API documentation

## 🆘 Need Help?

1. Check `README.md` troubleshooting section
2. Review `login_example.cpp` for working examples
3. Contact support through your AdiCheats dashboard

---

**You're all set! Happy coding! 🎉**

