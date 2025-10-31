# 🚀 START HERE - AdiCheats C++ Authentication

**Welcome! You're 5 minutes away from having working authentication in your C++ application.**

---

## 📖 Quick Navigation

### 🎯 **I want to get started RIGHT NOW**
→ Open **`SETUP_GUIDE.md`** and follow the 5 steps  
⏱️ Time: 5 minutes

### 💻 **I'm using Visual Studio**
→ Open **`VISUAL_STUDIO_SETUP.txt`**  
⏱️ Time: 10 minutes

### 📚 **I want to understand everything**
→ Open **`README.md`** for complete documentation  
⏱️ Time: 20 minutes

### 🔄 **I'm migrating from KeyAuth**
→ Open **`MIGRATION_FROM_KEYAUTH.md`**  
⏱️ Time: 15 minutes

### 📁 **I want to see the project structure**
→ Open **`FILE_OVERVIEW.md`**  
⏱️ Time: 5 minutes

### 🎉 **I want to see what was built**
→ Open **`PROJECT_SUMMARY.md`**  
⏱️ Time: 10 minutes

---

## ⚡ Super Quick Start (3 steps)

### Step 1: Configure Your Credentials (1 minute)

Open `auth.hpp` and find **lines 39-42**. Replace with your actual values:

```cpp
const std::string api_url = ("https://your-actual-url.replit.dev/api/v1");
const std::string api_key = ("your-actual-api-key");
const std::string app_version = ("1.0.0");
```

**Where to get these:**
- **API URL**: Your AdiCheats Dashboard → Applications → Your App → Settings
- **API Key**: Same place as above
- **Version**: Match what's in your app settings

### Step 2: Build the Example (2 minutes)

**Visual Studio:**
1. Create new Console App project
2. Add `auth.hpp`, `login_example.cpp`, `json.hpp`, and `Curl/` folder
3. Configure properties (see `VISUAL_STUDIO_SETUP.txt`)
4. Press F5 to run

**CMake:**
```bash
mkdir build
cd build
cmake ..
cmake --build .
.\bin\AdiCheatsAuth.exe
```

### Step 3: Test Login (30 seconds)

Run the program and enter credentials from your AdiCheats dashboard:

```
Username: testuser
Password: testpass
```

If login works → **Success!** 🎉  
If not → Check `SETUP_GUIDE.md` → Common Issues

---

## 🎯 What Do You Want to Do?

### **Add login to ImGui application**
```cpp
#include "auth.hpp"

if (ImGui::Button("Login")) {
    auto response = g_Auth.Login(username, password);
    if (response.success) {
        // Login successful!
    }
}
```
📖 Full example in `login_example.cpp` (line 80-140)

### **Add login to Console application**
```cpp
#include "auth.hpp"

auto response = g_Auth.Login("user", "pass");
if (response.success) {
    std::cout << "Welcome!" << std::endl;
}
```
📖 Full example in `login_example.cpp` (line 20-65)

### **Add login to Windows Forms**
```cpp
auto response = g_Auth.Login(username, password);
if (response.success) {
    MessageBox::Show("Welcome!");
}
```
📖 Full example in `login_example.cpp` (line 150-220)

---

## 📚 All Available Files

### 🔴 **Must Read (Pick One)**
- `SETUP_GUIDE.md` ⭐ **Fastest way to get started**
- `README.md` ⭐ **Complete reference**

### 🟡 **Read If Needed**
- `VISUAL_STUDIO_SETUP.txt` - If using Visual Studio
- `MIGRATION_FROM_KEYAUTH.md` - If migrating from KeyAuth
- `FILE_OVERVIEW.md` - To understand project structure
- `PROJECT_SUMMARY.md` - To see what was built

### 🟢 **Reference When Coding**
- `login_example.cpp` ⭐ **Copy code from here**
- `auth.hpp` - View the actual library code

### ⚫ **Build Files** (Don't Read)
- `CMakeLists.txt` - For CMake builds
- `json.hpp` - JSON library (dependency)
- `Curl/` - libcurl library (dependency)

---

## ❓ FAQ

### Q: Which file should I read first?
**A:** `SETUP_GUIDE.md` - It gets you running in 5 minutes.

### Q: Where do I get my API key and URL?
**A:** Your AdiCheats Dashboard → Applications → Select App → Settings

### Q: How do I integrate this into my application?
**A:** See `login_example.cpp` for your platform (ImGui/Console/Forms)

### Q: Do I need to call setup()?
**A:** No, it's optional. You can call `Login()` directly.

### Q: Can I use this with ImGui?
**A:** Yes! See `login_example.cpp` line 80-140 for full example.

### Q: I'm getting linking errors
**A:** See `VISUAL_STUDIO_SETUP.txt` → Troubleshooting

### Q: I'm getting "API key not configured"
**A:** Edit `auth.hpp` lines 39-42 with your actual credentials

### Q: How do I create users?
**A:** In your AdiCheats Dashboard → User Management → Add User

---

## 🛠️ Troubleshooting

### ❌ "API key not configured"
→ Edit `auth.hpp` lines 39-42 with your real credentials

### ❌ "Failed to initialize CURL"  
→ Check `VISUAL_STUDIO_SETUP.txt` → Link libcurl_a.lib

### ❌ "Invalid credentials" but they're correct
→ Check dashboard: User exists? User active? User not expired?

### ❌ "Connection timeout"
→ Check internet connection and API URL is correct

### ❌ Need more help?
→ Check `README.md` → Troubleshooting section

---

## 🎯 Recommended Path

### For Beginners:
1. Read `SETUP_GUIDE.md` (5 min)
2. Configure `auth.hpp` (1 min)
3. Compile `login_example.cpp` (2 min)
4. Test login (30 sec)
5. Copy code from `login_example.cpp` to your app (10 min)

### For Experienced Developers:
1. Skim `SETUP_GUIDE.md` (2 min)
2. Configure `auth.hpp` (1 min)
3. Read `README.md` → API Reference (10 min)
4. Integrate directly into your app (15 min)

### For Migrating from KeyAuth:
1. Read `MIGRATION_FROM_KEYAUTH.md` (15 min)
2. Follow migration steps
3. Test thoroughly

---

## ✅ Checklist

Before you start coding, make sure you have:

- [ ] Your AdiCheats account and dashboard access
- [ ] Your API URL (from dashboard)
- [ ] Your API Key (from dashboard)
- [ ] At least one test user created in dashboard
- [ ] Visual Studio 2017+ or CMake installed
- [ ] Configured `auth.hpp` with your credentials

---

## 🎉 You're Ready!

**Next step:** Open `SETUP_GUIDE.md` and get started!

---

## 📞 Need Help?

1. Check the documentation files (listed above)
2. Review troubleshooting sections
3. Look at working examples in `login_example.cpp`
4. Contact AdiCheats support through your dashboard

---

**Let's get your authentication working! 🚀**

*Everything you need is in this folder. Start with SETUP_GUIDE.md!*

