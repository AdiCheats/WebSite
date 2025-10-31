# 🔄 Migrating from KeyAuth to AdiCheats

This guide helps you transition from KeyAuth to the AdiCheats authentication system.

## Key Differences

### Architecture Comparison

| Feature | KeyAuth | AdiCheats |
|---------|---------|-----------|
| **Session Management** | Session ID based | User ID based |
| **Initialization** | Required (`setup()`) | Optional |
| **API Endpoint** | `/api/1.3/` | `/api/v1/` |
| **Request Format** | Form-encoded | JSON |
| **Response Format** | JSON | JSON |
| **HWID Generation** | Windows SID | Windows SID |
| **Authentication** | API key in body | API key in header |

## Code Migration Examples

### Example 1: Initialization

**KeyAuth**:
```cpp
c_api api;
auto result = api.setup();
if (result != "success") {
    // Handle error
}
```

**AdiCheats**:
```cpp
c_auth auth;
auto result = auth.setup();  // Optional!
if (!result.success) {
    // Handle error
}
```

### Example 2: Login

**KeyAuth**:
```cpp
c_api api;
api.setup();  // Required
auto result = api.Login("username", "password");
if (result == "success") {
    std::string user = api.client.username;
    std::string expiry = api.client.sub_type.expire_date;
}
```

**AdiCheats**:
```cpp
c_auth auth;
auto result = auth.Login("username", "password");
if (result.success) {
    std::string user = result.username;
    std::string expiry = result.expires_at;
    int userId = result.user_id;
}
```

### Example 3: Response Handling

**KeyAuth**:
```cpp
auto result = api.Login("user", "pass");
if (result == "success") {
    // Success - check api.client for user data
} else {
    // result contains error message
}
```

**AdiCheats**:
```cpp
auto result = auth.Login("user", "pass");
if (result.success) {
    // Success - all data in result structure
} else {
    // result.message contains error description
}
```

## Feature Mapping

### KeyAuth → AdiCheats Feature Mapping

| KeyAuth Feature | AdiCheats Equivalent |
|----------------|---------------------|
| `setup()` | `setup()` (optional) |
| `Login()` | `Login()` |
| `Register_key()` | Not in C++ lib (use dashboard) |
| `client.username` | `response.username` |
| `client.sub_type.expire_date` | `response.expires_at` |
| `client.hwid` | `GetHWID()` |
| Session ID | User ID |

### AdiCheats Additional Features

- ✅ **Session Verification**: `VerifySession(user_id)`
- ✅ **Version Checking**: Automatic version validation
- ✅ **HWID Locking**: Configurable per-application
- ✅ **Blacklist Support**: IP, username, HWID blocking
- ✅ **Webhook Integration**: Real-time event notifications
- ✅ **Better Error Messages**: Detailed error descriptions

## Step-by-Step Migration

### Step 1: Replace KeyAuth Files

**Remove**:
- `auth keyauth example.hpp` (or your KeyAuth file)

**Add**:
- `auth.hpp` (new AdiCheats file)
- `json.hpp` (if not already present)
- `Curl/` folder (if not already present)

### Step 2: Update Configuration

**KeyAuth** (old):
```cpp
const std::string keyauth_api = ("https://keyauth.win/api/1.3/");
const std::string name = ("Internal");
const std::string ownerid = ("7nB2WEZ1EY");
const std::string version = ("1.0");
```

**AdiCheats** (new):
```cpp
const std::string api_url = ("https://your-app.replit.dev/api/v1");
const std::string api_key = ("your-api-key");
const std::string app_version = ("1.0.0");
```

### Step 3: Update Login Code

**KeyAuth** (old):
```cpp
c_api g_Api;

// In initialization:
auto init = g_Api.setup();
if (init != "success") {
    exit(0);
}

// In login button:
auto result = g_Api.Login(username, password);
if (result == "success") {
    std::cout << "Welcome " << g_Api.client.username << std::endl;
} else {
    std::cout << "Error: " << result << std::endl;
}
```

**AdiCheats** (new):
```cpp
c_auth g_Auth;

// Setup is optional - can skip this
auto init = g_Auth.setup();
if (!init.success) {
    std::cerr << init.message << std::endl;
}

// In login button:
auto result = g_Auth.Login(username, password);
if (result.success) {
    std::cout << "Welcome " << result.username << std::endl;
    // Save result.user_id for later verification
} else {
    std::cout << "Error: " << result.message << std::endl;
}
```

### Step 4: Update Session Management

**KeyAuth** (old):
```cpp
// Session was managed via sessionid
// No built-in verification
```

**AdiCheats** (new):
```cpp
// Store user_id after login:
int currentUserId = loginResult.user_id;

// Verify session periodically:
auto verifyResult = g_Auth.VerifySession(currentUserId);
if (!verifyResult.success) {
    // Session expired - re-login required
}
```

## Common Migration Issues

### Issue 1: "setup() returns different type"

**KeyAuth**: Returns string ("success" or error)
**AdiCheats**: Returns Response struct

**Solution**:
```cpp
// Old:
if (api.setup() == "success") { }

// New:
if (auth.setup().success) { }
```

### Issue 2: "Cannot access client.username"

**KeyAuth**: User data in `api.client.*`
**AdiCheats**: User data in response struct

**Solution**:
```cpp
// Old:
std::string user = api.client.username;

// New:
auto response = auth.Login(user, pass);
std::string user = response.username;
```

### Issue 3: "No Register_key function"

**AdiCheats**: User registration is done through:
1. Dashboard UI (manual)
2. License key system (automatic)
3. External API calls (not in C++ lib)

**Solution**: Create users in your AdiCheats dashboard

### Issue 4: "Different response structure"

**KeyAuth**: `stc_client` struct
**AdiCheats**: `Response` struct

**Migration**:
```cpp
// Old KeyAuth:
struct stc_client {
    std::string username;
    std::string hwid;
    struct stc_sub_type {
        bool active;
        std::string expire_date;
    } sub_type;
} client;

// New AdiCheats:
struct Response {
    bool success;
    std::string message;
    int user_id;
    std::string username;
    std::string email;
    std::string expires_at;
    bool hwid_locked;
};
```

## Benefits of Migration

### 1. Better Error Handling
```cpp
// KeyAuth: Generic error messages
// AdiCheats: Detailed error descriptions + error codes
```

### 2. Structured Responses
```cpp
// KeyAuth: String return values
if (result == "success") { }

// AdiCheats: Structured response
if (result.success) {
    // Access all data from result
}
```

### 3. Session Verification
```cpp
// KeyAuth: No built-in session verification
// AdiCheats: Built-in VerifySession()
auto verify = auth.VerifySession(userId);
```

### 4. Version Control
```cpp
// AdiCheats automatically checks version and provides
// required_version and current_version in response
```

### 5. Modern API Design
- RESTful endpoints
- JSON-based communication
- Header-based authentication
- Better security practices

## Side-by-Side Comparison

### Full Login Implementation

**KeyAuth**:
```cpp
#include "auth keyauth example.hpp"

c_api g_Api;

void login() {
    auto init = g_Api.setup();
    if (init != "success") {
        std::cout << "Init failed: " << init << std::endl;
        return;
    }

    auto result = g_Api.Login("user", "pass");
    if (result == "success") {
        std::cout << "Welcome " << g_Api.client.username << std::endl;
        if (g_Api.client.sub_type.active) {
            std::cout << "Expires: " << g_Api.client.sub_type.expire_date << std::endl;
        }
    } else {
        std::cout << "Login failed: " << result << std::endl;
    }
}
```

**AdiCheats**:
```cpp
#include "auth.hpp"

c_auth g_Auth;

void login() {
    // Setup is optional
    auto init = g_Auth.setup();
    if (!init.success) {
        std::cout << "Init failed: " << init.message << std::endl;
        // Can continue anyway
    }

    auto result = g_Auth.Login("user", "pass");
    if (result.success) {
        std::cout << "Welcome " << result.username << std::endl;
        std::cout << "User ID: " << result.user_id << std::endl;
        if (!result.expires_at.empty()) {
            std::cout << "Expires: " << result.expires_at << std::endl;
        }
        if (result.hwid_locked) {
            std::cout << "HWID Lock: Enabled" << std::endl;
        }
    } else {
        std::cout << "Login failed: " << result.message << std::endl;
        
        // Check for version mismatch
        if (!result.required_version.empty()) {
            std::cout << "Please update to version " 
                      << result.required_version << std::endl;
        }
    }
}
```

## Testing Your Migration

### Checklist

- [ ] Replace KeyAuth files with AdiCheats files
- [ ] Update configuration in `auth.hpp`
- [ ] Update `setup()` calls (check `.success` instead of `== "success"`)
- [ ] Update `Login()` calls (use response struct instead of client struct)
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test version mismatch (if using version checking)
- [ ] Test HWID locking (if enabled)
- [ ] Add session verification if needed
- [ ] Update error handling to use `response.message`
- [ ] Rebuild and test thoroughly

## Need Help?

If you encounter issues during migration:

1. Check this migration guide
2. Review `README.md` for API reference
3. See `login_example.cpp` for working examples
4. Contact AdiCheats support

---

**Migration complete! Welcome to AdiCheats! 🎉**

