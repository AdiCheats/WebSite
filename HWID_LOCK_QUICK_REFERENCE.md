# 🔐 HWID Lock Quick Reference

## How It Works Now

**✅ User setting takes priority - Application setting is just the default**

| Application HWID Lock | User HWID Lock | Result |
|:--------------------:|:--------------:|:------:|
| ❌ Disabled | ❌ Disabled | HWID **NOT** locked ✅ |
| ❌ Disabled | ✅ Enabled | HWID **LOCKED** ✅ |
| ✅ Enabled | ❌ Disabled | HWID **NOT** locked ✅ |
| ✅ Enabled | ✅ Enabled | HWID **LOCKED** ✅ |

## Key Points

- 🎯 **User setting is the deciding factor**
- 📋 **Application setting is the default** for new users (if not specified)
- 🔓 **User can override** application setting either way
- 🚫 **No HWID saved** if user's `hwidLockEnabled = false`

## Creating Users

### Create user WITHOUT HWID lock (regardless of app setting)
```json
{
  "username": "user1",
  "password": "pass123",
  "hwidLockEnabled": false  // ✅ Won't lock HWID
}
```

### Create user WITH HWID lock (regardless of app setting)
```json
{
  "username": "user2",
  "password": "pass123",
  "hwidLockEnabled": true  // ✅ Will lock HWID
}
```

### Create user using application default
```json
{
  "username": "user3",
  "password": "pass123"
  // No hwidLockEnabled - uses app setting
}
```

## Updating Users

### Disable HWID lock (clears existing HWID)
```json
{
  "hwidLockEnabled": false  // ✅ Clears HWID automatically
}
```

### Enable HWID lock
```json
{
  "hwidLockEnabled": true  // ✅ HWID will be saved on next login
}
```

## Real-World Examples

### Example 1: Premium Users Get HWID Lock
- Application HWID Lock: ❌ Disabled
- Free user: `hwidLockEnabled: false` → Can use multiple devices
- Premium user: `hwidLockEnabled: true` → Locked to one device

### Example 2: Testing Account Without Lock
- Application HWID Lock: ✅ Enabled
- Production users: inherit app setting (locked)
- Test account: `hwidLockEnabled: false` → Can test from any device

### Example 3: Family Plan
- Application HWID Lock: ✅ Enabled
- Main account: `hwidLockEnabled: true` → Locked
- Family members: `hwidLockEnabled: false` → Can share

## What Happens During Login

### If `user.hwidLockEnabled = false`:
1. ✅ User can login from any device
2. ✅ HWID is **never** saved
3. ✅ No HWID validation
4. ✅ Works even if application HWID lock is enabled

### If `user.hwidLockEnabled = true`:
1. 🔒 First login → HWID is saved
2. 🔒 Subsequent logins → HWID must match
3. ❌ Different device → Login rejected
4. 🔒 Works even if application HWID lock is disabled

## Migration Notes

### Existing Users (Created Before This Fix)
- Will have `hwidLockEnabled = undefined`
- Code treats as `false` by default
- To enable HWID lock: Update user with `hwidLockEnabled: true`

### Recommended Approach
1. Update existing users who should have HWID lock
2. Set `hwidLockEnabled: true` for them
3. Leave others as-is (defaults to unlocked)

## Testing Checklist

- [ ] Create user with `hwidLockEnabled: false` → Login from 2 devices → Both work ✅
- [ ] Create user with `hwidLockEnabled: true` → Login from Device A → Login from Device B → Second login fails ✅
- [ ] App HWID disabled + User HWID enabled → User gets locked ✅
- [ ] App HWID enabled + User HWID disabled → User NOT locked ✅
- [ ] Update user `hwidLockEnabled: false` → Existing HWID cleared ✅

## Summary

**Before:** Application HWID lock setting applied to ALL users  
**After:** Each user has individual HWID lock control  

**Result:** ✅ Complete flexibility - Lock some users, not others!


