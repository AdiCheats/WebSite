# License System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify GitHub Configuration

Make sure your `.env` file has these variables:

```env
GITHUB_TOKEN=your_github_token_here
GITHUB_USER=AdiCheats
GITHUB_REPO=AimkillAuth
```

The system will automatically create `License.json` in your repository on first use.

---

### Step 2: Access License Management

1. Start your server
2. Login to your dashboard
3. Navigate to any application
4. Click on **"License Keys"** in the navigation

---

### Step 3: Create Your First License

**Option A: Generate Auto Key (Recommended)**
```
1. Click "Generate Key" button
2. Set Max Users (e.g., 100)
3. Set Validity Days (e.g., 365)
4. Add description (optional)
5. Toggle "Enable HWID Lock" if needed
6. Click "Generate"
```

**Option B: Create Custom Key**
```
1. Click "Create Custom Key" button
2. Enter your custom license key
3. Set Max Users and Validity Days
4. Toggle "Enable HWID Lock" if needed
5. Click "Create"
```

---

### Step 4: Manage HWID Protection

#### To Lock a Custom HWID:
```
1. Find your license in the table
2. Click the 🔒 Lock icon
3. Enter the HWID
4. Click "Lock HWID"
```

#### To Reset HWID:
```
1. Find a license with HWID locked
2. Click the 🔄 Reset icon
3. HWID is cleared (lock stays enabled)
```

#### To Unlock HWID:
```
1. Find a license with HWID locked
2. Click the 🔓 Unlock icon
3. HWID lock is completely disabled
```

---

### Step 5: Test License Validation

Use this cURL command or integrate into your client:

```bash
curl -X POST https://adicheats.auth.kesug.com/api/v1/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "YOUR-LICENSE-KEY",
    "applicationId": YOUR_APP_ID,
    "hwid": "optional-hardware-id"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "License is valid",
  "license": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Hardware ID mismatch"
}
```

---

## 📊 Dashboard Overview

After creating licenses, your dashboard shows:

- **Total Keys**: All licenses created
- **Active Keys**: Currently valid licenses
- **HWID Locked**: Licenses with HWID protection
- **Banned Keys**: Licenses that are banned

---

## 🔧 Common Operations

### Ban a License
```
1. Find the license
2. Click the 🛡️ Shield icon (red)
3. License is immediately banned
```

### Unban a License
```
1. Find the banned license
2. Click the ✅ Shield Check icon (green)
3. License is unbanned and active
```

### Delete a License
```
1. Find the license
2. Click the 🗑️ Trash icon
3. Confirm deletion
4. License is permanently removed
```

### Copy License Key
```
1. Find the license
2. Click the 📋 Copy icon next to the key
3. Key is copied to clipboard
```

---

## 🔒 HWID Protection Explained

### What is HWID Lock?

HWID (Hardware ID) lock ties a license to specific hardware. When enabled:
- License can only be used on one specific device
- Prevents license sharing across multiple machines
- Protects your software from piracy

### How It Works:

1. **First Use**: When a user first validates the license with HWID lock enabled, their hardware ID is saved
2. **Subsequent Uses**: System checks if the hardware ID matches
3. **Mismatch**: If hardware doesn't match, validation fails

### Use Cases:

**Enable HWID Lock When:**
- Selling single-user licenses
- Preventing license sharing
- Limiting to specific hardware

**Disable HWID Lock When:**
- Allowing multi-device usage
- Testing purposes
- Flexible deployment scenarios

---

## 📝 Integration Examples

### JavaScript/TypeScript Client

```typescript
async function validateLicense(licenseKey: string, hwid?: string) {
  try {
    const response = await fetch('https://adicheats.auth.kesug.com/api/v1/license/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        applicationId: YOUR_APP_ID,
        hwid
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ License valid!');
      return true;
    } else {
      console.error('❌ License invalid:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error validating license:', error);
    return false;
  }
}

// Usage
const isValid = await validateLicense('YOUR-LICENSE-KEY', 'user-hardware-id');
```

### C++ Client Example

```cpp
#include <curl/curl.h>
#include <json.hpp>

bool validateLicense(const std::string& licenseKey, const std::string& hwid) {
    CURL* curl = curl_easy_init();
    if (!curl) return false;

    nlohmann::json payload = {
        {"licenseKey", licenseKey},
        {"applicationId", YOUR_APP_ID},
        {"hwid", hwid}
    };

    std::string jsonStr = payload.dump();
    
    curl_easy_setopt(curl, CURLOPT_URL, "https://adicheats.auth.kesug.com/api/v1/license/validate");
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonStr.c_str());
    
    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    
    return (res == CURLE_OK);
}
```

### C# Client Example

```csharp
using System.Net.Http;
using System.Text.Json;

public async Task<bool> ValidateLicense(string licenseKey, string hwid)
{
    using var client = new HttpClient();
    
    var payload = new
    {
        licenseKey = licenseKey,
        applicationId = YOUR_APP_ID,
        hwid = hwid
    };
    
    var content = new StringContent(
        JsonSerializer.Serialize(payload),
        Encoding.UTF8,
        "application/json"
    );
    
    var response = await client.PostAsync(
        "https://adicheats.auth.kesug.com/api/v1/license/validate",
        content
    );
    
    if (response.IsSuccessStatusCode)
    {
        var result = await response.Content.ReadAsStringAsync();
        var json = JsonSerializer.Deserialize<ValidationResult>(result);
        return json.Success;
    }
    
    return false;
}
```

---

## 🎯 Best Practices

1. **HWID Management**
   - Enable HWID lock for premium/paid licenses
   - Provide reset option for legitimate hardware changes
   - Store HWID securely on client side

2. **License Creation**
   - Use descriptive names in descriptions
   - Set appropriate validity periods
   - Monitor expiration dates

3. **Security**
   - Never expose license validation endpoint publicly without rate limiting
   - Always validate on server-side
   - Keep GitHub token secure

4. **User Experience**
   - Clear error messages for HWID mismatches
   - Allow users to request HWID resets
   - Notify users before license expiration

---

## 🐛 Troubleshooting

### License not showing in UI
- Check if you're logged in
- Verify you own the application
- Refresh the page

### HWID validation failing
- Verify HWID is being sent correctly
- Check if HWID lock is enabled
- Try resetting HWID from dashboard

### License.json not created
- Check GitHub token permissions
- Verify repository exists
- Check .env configuration

### API returning 404
- Verify URL is correct (should be `/api/v1/license/*`)
- Check applicationId is correct
- Ensure license exists

---

## 📚 Additional Resources

- **Full Documentation**: `LICENSE_SYSTEM_COMPLETE.md`
- **API Endpoints**: All endpoints at `/api/v1/license/*`
- **Frontend**: `client/src/pages/license-keys.tsx`
- **Backend Service**: `server/licenseService.ts`
- **API Routes**: `server/routes.ts` (search for "NEW LICENSE SYSTEM API")

---

## ✅ Next Steps

1. ✅ Create your first license
2. ✅ Test HWID locking
3. ✅ Integrate validation in your client
4. ✅ Monitor license usage
5. ✅ Set up expiration reminders

---

**Ready to go!** 🎉

Your license system is fully set up and ready to use. Create your first license and start protecting your software!

---

**Questions?** Check `LICENSE_SYSTEM_COMPLETE.md` for detailed documentation.

