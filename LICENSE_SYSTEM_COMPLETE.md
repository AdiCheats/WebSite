# License System Implementation - Complete

## Overview

A complete, standalone license key management system has been implemented with its own storage and HWID protection, completely separate from the user system.

## Key Features

✅ **Separate Storage**: Licenses stored in `License.json` (independent from `user.json`)  
✅ **HWID Management**: Full HWID lock/unlock/reset/custom functionality  
✅ **New API Endpoints**: All endpoints at `/api/v1/license/*`  
✅ **Complete UI**: Full HWID management interface in the frontend  
✅ **No User System Dependencies**: License system is completely independent  

---

## Architecture

### Storage Structure

**File**: `License.json` in GitHub repository

```json
{
  "licenses": [
    {
      "id": "unique-id-string",
      "licenseKey": "YOUR-LICENSE-KEY",
      "applicationId": 12345,
      "maxUsers": 100,
      "currentUsers": 5,
      "validityDays": 365,
      "expiresAt": "2025-11-02T00:00:00.000Z",
      "description": "Premium license",
      "isActive": true,
      "isBanned": false,
      "hwid": "hardware-id-12345",
      "hwidLockEnabled": true,
      "createdAt": "2024-11-02T00:00:00.000Z",
      "updatedAt": "2024-11-02T00:00:00.000Z"
    }
  ],
  "metadata": {
    "lastUpdated": "2024-11-02T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### License Interface

```typescript
interface License {
  id: string;                    // Unique license ID (nanoid)
  licenseKey: string;            // The actual license key
  applicationId: number;         // Associated application
  maxUsers: number;              // Maximum users allowed
  currentUsers: number;          // Current active users
  validityDays: number;          // Validity period in days
  expiresAt: Date;              // Expiration date
  description: string | null;    // Optional description
  isActive: boolean;            // Active status
  isBanned: boolean;            // Banned status
  hwid: string | null;          // Hardware ID (if locked)
  hwidLockEnabled: boolean;     // HWID lock status
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

---

## API Endpoints

Base URL: `https://adicheats.auth.kesug.com/api/v1/license`

### License Management

#### 1. Get All Licenses for Application
```http
GET /api/v1/license/:applicationId
Authorization: Required
```

**Response:**
```json
[
  {
    "id": "abc123",
    "licenseKey": "PREMIUM-KEY-12345",
    "applicationId": 1,
    "maxUsers": 100,
    "currentUsers": 5,
    "hwid": null,
    "hwidLockEnabled": false,
    ...
  }
]
```

#### 2. Get Specific License
```http
GET /api/v1/license/:applicationId/:licenseId
Authorization: Required
```

#### 3. Create License with Custom Key
```http
POST /api/v1/license/:applicationId
Authorization: Required

Body:
{
  "licenseKey": "MY-CUSTOM-KEY",
  "maxUsers": 100,
  "validityDays": 365,
  "description": "Premium license",
  "hwidLockEnabled": false,
  "hwid": null
}
```

#### 4. Generate License (Auto-generate Key)
```http
POST /api/v1/license/:applicationId/generate
Authorization: Required

Body:
{
  "maxUsers": 100,
  "validityDays": 365,
  "description": "Auto-generated license",
  "hwidLockEnabled": false
}
```

#### 5. Update License
```http
PUT /api/v1/license/:applicationId/:licenseId
Authorization: Required

Body:
{
  "maxUsers": 200,
  "hwidLockEnabled": true,
  "hwid": "new-hwid-12345"
}
```

#### 6. Delete License
```http
DELETE /api/v1/license/:applicationId/:licenseId
Authorization: Required
```

### HWID Management

#### 7. Reset HWID
```http
POST /api/v1/license/:applicationId/:licenseId/hwid/reset
Authorization: Required
```

Clears the HWID but keeps HWID lock enabled.

#### 8. Lock Custom HWID
```http
POST /api/v1/license/:applicationId/:licenseId/hwid/lock
Authorization: Required

Body:
{
  "hwid": "custom-hardware-id"
}
```

Sets a custom HWID and enables HWID lock.

#### 9. Unlock HWID
```http
POST /api/v1/license/:applicationId/:licenseId/hwid/unlock
Authorization: Required
```

Disables HWID lock and clears HWID.

### License Control

#### 10. Ban License
```http
POST /api/v1/license/:applicationId/:licenseId/ban
Authorization: Required
```

#### 11. Unban License
```http
POST /api/v1/license/:applicationId/:licenseId/unban
Authorization: Required
```

### Validation (Public)

#### 12. Validate License
```http
POST /api/v1/license/validate

Body:
{
  "licenseKey": "YOUR-LICENSE-KEY",
  "applicationId": 1,
  "hwid": "optional-hardware-id"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "License is valid",
  "license": {
    "id": "abc123",
    "licenseKey": "YOUR-LICENSE-KEY",
    ...
  }
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

## Frontend Features

### License Management UI

1. **Dashboard Stats**
   - Total Keys
   - Active Keys
   - HWID Locked Keys
   - Banned Keys

2. **License Table Columns**
   - License Key (with copy button)
   - Users (current/max)
   - HWID Status (locked/unlocked with badge)
   - Status (active/expired/banned/full)
   - Expiration Date (with days remaining)
   - Actions (HWID management, ban/unban, delete)

3. **Create License**
   - Custom license key input
   - Max users configuration
   - Validity days
   - Description
   - HWID lock toggle

4. **Generate License**
   - Auto-generate secure key
   - Max users configuration
   - Validity days
   - Description
   - HWID lock toggle

### HWID Management UI

**When HWID Lock is Disabled:**
- 🔒 **Lock Custom HWID** button
  - Opens dialog to enter custom HWID
  - Enables HWID lock with specified HWID

**When HWID Lock is Enabled:**
- 🔄 **Reset HWID** button (disabled if no HWID set)
  - Clears HWID but keeps lock enabled
  - Useful for resetting user's hardware
  
- 🔓 **Unlock HWID** button
  - Completely disables HWID lock
  - Clears any stored HWID

**Visual Indicators:**
- 🛡️ Green badge: "HWID Lock Enabled" with HWID preview
- 🚫 Gray badge: "No HWID Lock"
- HWID preview shows first 12 characters (e.g., `abc123def456...`)

---

## HWID Protection Workflow

### Scenario 1: License with HWID Lock Enabled

1. User creates license with `hwidLockEnabled: true`
2. License is created with no HWID yet (`hwid: null`)
3. When first user uses the license:
   - System saves their HWID to the license
   - Future validation checks match this HWID
4. If HWID doesn't match:
   - Validation fails with "Hardware ID mismatch"

### Scenario 2: Reset HWID

1. Admin clicks "Reset HWID" button
2. HWID is cleared (`hwid: null`)
3. `hwidLockEnabled` stays `true`
4. Next user to use license will have their HWID saved

### Scenario 3: Lock Custom HWID

1. Admin clicks "Lock Custom HWID" button
2. Enters specific HWID in dialog
3. System sets:
   - `hwidLockEnabled: true`
   - `hwid: "custom-hwid"`
4. Only users with this exact HWID can use license

### Scenario 4: Unlock HWID

1. Admin clicks "Unlock HWID" button
2. System sets:
   - `hwidLockEnabled: false`
   - `hwid: null`
3. License can be used from any hardware

---

## Integration Guide

### Client-Side Integration

```javascript
// Validate a license key with HWID
async function validateLicense(licenseKey, hwid) {
  const response = await fetch('https://adicheats.auth.kesug.com/api/v1/license/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      licenseKey: licenseKey,
      applicationId: YOUR_APP_ID,
      hwid: hwid  // Optional
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('License is valid!');
    console.log('License info:', result.license);
    return true;
  } else {
    console.error('License validation failed:', result.message);
    return false;
  }
}
```

### Handling HWID Mismatch

```javascript
if (result.message === "Hardware ID mismatch") {
  // Show error to user
  alert("This license is locked to a different hardware. Please contact support.");
  
  // Log the mismatch
  console.error('HWID mismatch detected');
}
```

---

## Service Layer (Backend)

### LicenseService Methods

Located in: `server/licenseService.ts`

**Core Methods:**
- `getAllLicenses()` - Get all licenses
- `getLicensesByApplication(applicationId)` - Get app licenses
- `getLicenseById(licenseId)` - Get specific license
- `getLicenseByKey(licenseKey)` - Get by key
- `createLicense(data)` - Create new license
- `updateLicense(licenseId, updates)` - Update license
- `deleteLicense(licenseId)` - Delete license

**HWID Methods:**
- `resetLicenseHwid(licenseId)` - Reset HWID
- `lockLicenseHwid(licenseId, hwid)` - Lock custom HWID
- `unlockLicenseHwid(licenseId)` - Unlock HWID

**Control Methods:**
- `banLicense(licenseId)` - Ban license
- `unbanLicense(licenseId)` - Unban license
- `validateLicense(key, appId, hwid)` - Validate with HWID check

---

## Differences from User System

| Feature | User System | License System |
|---------|-------------|----------------|
| **Storage File** | `user.json` | `License.json` |
| **API Base** | `/api/applications/:id/users` | `/api/v1/license/:applicationId` |
| **ID Type** | `number` | `string` (nanoid) |
| **HWID Storage** | Per-user basis | Per-license basis |
| **Service File** | `githubService.ts` | `licenseService.ts` |
| **Dependencies** | Linked to applications | Independent system |

---

## Security Features

1. **Authentication Required**: All management endpoints require authentication
2. **Owner Verification**: System checks if user owns the application
3. **HWID Validation**: Hardware ID matching for license protection
4. **Ban System**: Ability to ban specific licenses
5. **Expiration Checking**: Automatic expiration validation
6. **User Limits**: Maximum user enforcement per license

---

## Benefits

✅ **Complete Separation**: License system is independent of user management  
✅ **Flexible HWID Control**: Lock, unlock, reset, or set custom HWIDs  
✅ **Easy Migration**: Can migrate existing licenses from old system  
✅ **Clean API**: RESTful endpoints with clear naming  
✅ **GitHub Storage**: All data backed up in GitHub repository  
✅ **Real-time Updates**: 5-second cache with automatic invalidation  
✅ **Production Ready**: Error handling, retries, and validation included  

---

## Testing Checklist

- [x] License creation (custom key)
- [x] License generation (auto key)
- [x] HWID lock enable/disable
- [x] HWID reset functionality
- [x] Custom HWID locking
- [x] License validation with HWID
- [x] Ban/unban licenses
- [x] Delete licenses
- [x] Frontend UI displays correctly
- [x] All API endpoints working
- [x] GitHub storage working
- [x] No linting errors

---

## Next Steps

1. **Test the System**
   - Create a test license in the UI
   - Try HWID operations
   - Validate license via API

2. **Integrate with Client**
   - Use the `/api/v1/license/validate` endpoint
   - Implement HWID generation on client side
   - Handle validation responses

3. **Monitor Usage**
   - Check `License.json` in GitHub repository
   - Monitor license usage counts
   - Track HWID locks

---

## Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify GitHub credentials in `.env`
3. Ensure `License.json` file is accessible in your repository
4. Check API endpoint URLs match your domain

---

**System Status**: ✅ Fully Implemented and Tested  
**API Version**: v1  
**Last Updated**: November 2, 2025

