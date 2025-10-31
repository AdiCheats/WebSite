# 📁 AdiCheats C++ Authentication Library - File Overview

This document provides an overview of all files in the AdiCheats C++ authentication library.

## 📚 Core Library Files

### `auth.hpp` ⭐ MAIN FILE
**Purpose**: Complete authentication library header  
**Size**: ~350 lines  
**Type**: Header-only C++ library  

**What it contains**:
- `c_auth` class - Main authentication interface
- `Response` struct - Authentication response structure
- `Login()` - Username/password authentication
- `VerifySession()` - Session validation
- `setup()` - Optional initialization
- Automatic HWID generation
- HTTP request handling via libcurl
- JSON parsing via nlohmann::json

**Key configuration** (lines 39-42):
```cpp
const std::string api_url = ("https://your-replit-url.replit.dev/api/v1");
const std::string api_key = ("your-api-key-here");
const std::string app_version = ("1.0.0");
```

**Global instance**:
```cpp
inline c_auth g_Auth;  // Use this in your application
```

---

### `json.hpp`
**Purpose**: JSON parsing library (nlohmann::json)  
**Size**: ~25,000 lines  
**Type**: Header-only library  
**License**: MIT  

**Usage**: Already integrated in `auth.hpp` - no manual setup needed.

---

## 📖 Documentation Files

### `README.md` ⭐ COMPLETE DOCUMENTATION
**Purpose**: Complete library documentation  
**Sections**:
- Features overview
- Requirements and dependencies
- Quick start guide
- Configuration instructions
- Usage examples (Console, ImGui, Windows Forms)
- Complete API reference
- Integration guides
- Troubleshooting
- Security best practices

**When to read**: After initial setup, for API reference

---

### `SETUP_GUIDE.md` ⭐ START HERE
**Purpose**: Quick 5-minute setup guide  
**Sections**:
- 5-step quick setup
- Visual Studio instructions
- CMake instructions
- Test login walkthrough
- Integration examples
- Common issues & fixes

**When to read**: FIRST - before doing anything else

---

### `VISUAL_STUDIO_SETUP.txt`
**Purpose**: Detailed Visual Studio project configuration  
**Format**: Plain text with step-by-step instructions  
**Sections**:
- Project creation
- File management
- Property configuration
- Build settings
- Troubleshooting
- Platform-specific notes

**When to read**: If using Visual Studio IDE

---

### `MIGRATION_FROM_KEYAUTH.md`
**Purpose**: Migration guide from KeyAuth to AdiCheats  
**Sections**:
- Feature comparison
- Code migration examples
- Step-by-step migration
- Side-by-side comparisons
- Common migration issues

**When to read**: If you're migrating from KeyAuth

---

## 💻 Example Code

### `login_example.cpp` ⭐ WORKING EXAMPLES
**Purpose**: Complete working examples  
**Size**: ~350 lines  
**Type**: Compilable C++ source  

**Contains**:
1. **Console Login Example** - Simple command-line login
2. **ImGui Integration** - GUI application integration
3. **Windows Forms Integration** - Win32 forms integration
4. **Session Verification** - Advanced session handling

**How to use**:
- Compile and run for console example
- Copy relevant sections for your application
- Reference for integration patterns

---

## 🔧 Build Configuration

### `CMakeLists.txt`
**Purpose**: CMake build configuration  
**Platforms**: Windows, Linux (with modifications)  
**Type**: CMake script  

**Features**:
- Automatic dependency linking
- Platform-specific settings
- Easy build process
- Installation configuration

**Usage**:
```bash
mkdir build
cd build
cmake ..
cmake --build .
```

---

## 📦 Dependencies (Curl/ folder)

### Header Files
- `curl.h` - Main libcurl header
- `easy.h` - Easy interface
- `multi.h` - Multi interface
- `curlver.h` - Version info
- `header.h` - Header utilities
- `mprintf.h` - Printf utilities
- `options.h` - Option definitions
- `stdcheaders.h` - Standard headers
- `system.h` - System definitions
- `typecheck-gcc.h` - Type checking
- `urlapi.h` - URL API
- `websockets.h` - WebSocket support

### Library Files
- `libcurl_a.lib` - Release build static library
- `libcurl_a_debug.lib` - Debug build static library

**Note**: These files are pre-compiled and ready to use. No manual compilation needed.

---

## 📋 Reference Files

### `FILE_OVERVIEW.md` (This File)
**Purpose**: Overview of all project files  
**When to read**: To understand project structure

---

### `auth keyauth example.hpp` 🗑️ LEGACY
**Purpose**: Original KeyAuth example (for reference only)  
**Status**: Not used - kept for comparison  
**When to read**: Only if migrating from KeyAuth

---

## 🗂️ File Organization

```
client/example/
│
├── 📄 Core Library
│   ├── auth.hpp ⭐ Main authentication library
│   └── json.hpp         JSON parsing
│
├── 📖 Documentation (Read in this order)
│   ├── SETUP_GUIDE.md ⭐ START HERE (5 min setup)
│   ├── README.md ⭐ Complete documentation
│   ├── VISUAL_STUDIO_SETUP.txt   VS configuration
│   ├── MIGRATION_FROM_KEYAUTH.md KeyAuth migration
│   └── FILE_OVERVIEW.md          This file
│
├── 💻 Examples
│   └── login_example.cpp ⭐ Working examples
│
├── 🔧 Build Files
│   └── CMakeLists.txt    CMake configuration
│
└── 📦 Dependencies
    └── Curl/
        ├── *.h           Header files
        └── *.lib         Static libraries
```

## 🎯 Quick Reference by Task

### "I want to get started ASAP"
1. Read: `SETUP_GUIDE.md`
2. Edit: `auth.hpp` (lines 39-42)
3. Compile: `login_example.cpp`

### "I'm using Visual Studio"
1. Read: `SETUP_GUIDE.md` → Step 3 → Option A
2. Read: `VISUAL_STUDIO_SETUP.txt`
3. Edit: `auth.hpp` (configure credentials)

### "I'm using CMake"
1. Read: `SETUP_GUIDE.md` → Step 3 → Option B
2. Run: CMake commands from guide
3. Edit: `auth.hpp` (configure credentials)

### "I need to integrate into my app"
1. Read: `README.md` → Integration Guide
2. Read: `login_example.cpp` → Your platform (ImGui/Console/Forms)
3. Copy relevant code to your application

### "I'm migrating from KeyAuth"
1. Read: `MIGRATION_FROM_KEYAUTH.md`
2. Follow step-by-step migration
3. Test thoroughly

### "I'm having problems"
1. Check: `SETUP_GUIDE.md` → Common Issues
2. Check: `README.md` → Troubleshooting
3. Check: `VISUAL_STUDIO_SETUP.txt` → Troubleshooting

### "I need API reference"
1. Read: `README.md` → API Reference
2. Check: `auth.hpp` → Comments in code
3. See: `login_example.cpp` → Usage examples

## 📊 File Statistics

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `auth.hpp` | C++ Header | ~350 | Main library |
| `json.hpp` | C++ Header | ~25,000 | JSON parsing |
| `login_example.cpp` | C++ Source | ~350 | Examples |
| `README.md` | Markdown | ~800 | Full docs |
| `SETUP_GUIDE.md` | Markdown | ~400 | Quick setup |
| `VISUAL_STUDIO_SETUP.txt` | Text | ~200 | VS setup |
| `MIGRATION_FROM_KEYAUTH.md` | Markdown | ~600 | Migration |
| `CMakeLists.txt` | CMake | ~80 | Build config |
| `FILE_OVERVIEW.md` | Markdown | ~300 | This file |

## 🎓 Learning Path

### Beginner Path
1. `SETUP_GUIDE.md` - Get it running
2. `login_example.cpp` - See it work
3. `README.md` (Usage Examples) - Learn basics
4. Integrate into your app

### Advanced Path
1. `SETUP_GUIDE.md` - Quick setup
2. `README.md` (API Reference) - Deep dive
3. `auth.hpp` source code - Understand internals
4. `MIGRATION_FROM_KEYAUTH.md` - Advanced patterns

### Migration Path (from KeyAuth)
1. `MIGRATION_FROM_KEYAUTH.md` - Full migration guide
2. `SETUP_GUIDE.md` - New setup
3. `README.md` (API Reference) - New API
4. Test and verify

## ✅ Files You MUST Edit

### Required: `auth.hpp`
**Lines to edit**: 39-42  
**What to change**:
```cpp
const std::string api_url = ("YOUR-API-URL");
const std::string api_key = ("YOUR-API-KEY");
const std::string app_version = ("YOUR-VERSION");
```

### Optional: `CMakeLists.txt`
**When to edit**: If project name or paths change  
**What to change**: Project name, paths, etc.

### Optional: `login_example.cpp`
**When to edit**: Never! Use as reference only  
**What to do**: Copy code into your own application

## 🔒 Files to Keep Secure

### ⚠️ NEVER commit to GitHub (after configuration):
- `auth.hpp` - Contains your API key after configuration
  
### ✅ Safe to commit:
- All documentation files
- `login_example.cpp`
- `CMakeLists.txt`
- `json.hpp`
- `Curl/` folder

### 💡 Best Practice:
1. Create `auth.hpp.template` (with placeholder values)
2. Add `auth.hpp` to `.gitignore`
3. Commit `auth.hpp.template` instead

## 🎉 You're Ready!

All files are ready to use. Follow the **Learning Path** above or jump straight to `SETUP_GUIDE.md` to begin!

---

**Questions? Check README.md or contact support!**

