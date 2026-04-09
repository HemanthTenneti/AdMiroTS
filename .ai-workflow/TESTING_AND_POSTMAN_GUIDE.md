# Testing & Postman Guide

## Quick Start - Postman Collection

### Import the Collection

1. **Open Postman**
2. **Click** → Collections → Import
3. **Select** → `.ai-workflow/AdMiro_API_Postman_Collection.json`
4. **Done!** All 40+ endpoints are now available

### Configure Environment

Before testing, set up the environment variables:

1. **Create Environment** in Postman:
   - **base_url**: `http://localhost:8000`
   - **auth_token**: (auto-filled after login)
   - **user_id**: (auto-filled after login)
   - **ad_id**: (auto-filled after creating ad)
   - **display_id**: (auto-filled after creating display)
   - **loop_id**: (auto-filled after creating loop)

### Test Flow (Recommended Order)

```
1. Health Check
   └─ Verify server is running

2. Authentication
   ├─ Register (creates new user)
   ├─ Login (gets auth_token)
   └─ Get Current User (verify token works)

3. Profile
   ├─ Get Profile
   ├─ Update Profile
   └─ Upload Avatar

4. Advertisements
   ├─ Create Advertisement (auto-saves ad_id)
   ├─ List Advertisements
   ├─ Get Advertisement
   ├─ Update Advertisement
   ├─ Activate Advertisement
   ├─ Deactivate Advertisement
   └─ Delete Advertisement

5. Displays
   ├─ Create Display (auto-saves display_id)
   ├─ List Displays
   ├─ Get Display
   ├─ Get Display Status
   ├─ Update Display
   ├─ Pair Display
   ├─ Get Display Loops
   └─ Delete Display

6. Display Loops
   ├─ Create Loop (auto-saves loop_id)
   ├─ List Loops
   ├─ Get Loop
   ├─ Update Loop
   ├─ Add Advertisement to Loop
   ├─ Remove Advertisement from Loop
   └─ Delete Loop

7. Analytics
   ├─ Record Event
   ├─ List Analytics
   └─ Get Aggregated Stats

8. System Logs
   ├─ Record Log
   └─ List Logs
```

### Running Tests

**Auto-extraction of IDs**:
Each request has test scripts that auto-save responses to environment variables:
- ✅ Register → saves `auth_token`, `user_id`
- ✅ Create Ad → saves `ad_id`
- ✅ Create Display → saves `display_id`
- ✅ Create Loop → saves `loop_id`

**To run**:
1. Start your API: `npm run dev`
2. In Postman → Click "Register" → Send
3. All subsequent requests will use the saved tokens/IDs

---

## Unit Testing (Local)

### Setup

Tests are configured with Jest and TypeScript support.

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Current Test Structure

```
apps/api/src/
├── modules/
│   ├── advertisements/
│   │   └── __tests__/
│   │       └── advertisements.service.test.ts (skeleton)
│   └── displays/
│       └── __tests__/
│           └── displays.service.test.ts (skeleton)
```

### Test Coverage Targets

**High Priority** (Ownership Validation):
```
✅ Advertisements.updateAdvertisement()
   ├─ Owner can update own ad
   ├─ Non-owner cannot update
   └─ Ad not found returns error

✅ Advertisements.deleteAdvertisement()
✅ Advertisements.activateAdvertisement()
✅ Advertisements.deactivateAdvertisement()

✅ Displays.updateDisplay()
✅ Displays.deleteDisplay()
```

---

## Security Testing

### Test with Invalid Token

```bash
# Use Postman to send request without auth_token
# Expected: 401 Unauthorized
```

### Test Ownership Validation

```
1. Create Ad as User A
2. Try to update Ad as User B
   Expected: 403 Forbidden (ownership check)
3. Try to delete Ad as User B
   Expected: 403 Forbidden
```

### Test Rate Limiting

```bash
# Make 100 requests to /api/auth/login in 15 minutes
# Expected: 429 Too Many Requests after limit exceeded
```

---

## Integration Test Examples

### Ownership Check Test

**Scenario**: Advertiser A creates an ad, Advertiser B tries to modify it

```bash
# 1. Register as User A
POST /api/auth/register
Body: { username: "advertiser-a", ... }
Response: { auth_token: "token-a", user_id: "user-a" }

# 2. Create Ad as User A
POST /api/advertisements
Headers: Authorization: Bearer token-a
Body: { adName: "Summer Sale", ... }
Response: { id: "ad-123", advertiserId: "user-a" }

# 3. Register as User B
POST /api/auth/register
Body: { username: "advertiser-b", ... }
Response: { auth_token: "token-b", user_id: "user-b" }

# 4. Try to update Ad as User B
PUT /api/advertisements/ad-123
Headers: Authorization: Bearer token-b
Body: { adName: "Hacked Name" }
Expected Response: 403 Forbidden
{
  "error": "You do not have permission to modify this advertisement"
}
```

---

## API Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successfully retrieved resource |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | No permission (ownership check) |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## Environment Variables (.env)

```bash
# Required
PORT=8000
MONGODB_URI=mongodb://localhost:27017/admiro
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Optional
NODE_ENV=development
```

---

## Troubleshooting

### "Connection refused" error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in .env

### "JWT_SECRET is required"
- Set `JWT_SECRET` environment variable
- Restart dev server: `npm run dev`

### Tests fail with "Cannot find module"
- Run `npm install` in `apps/api`
- Check Jest config: `jest.config.json`

### Rate limit errors
- Clear Postman variables and restart server
- Rate limits reset after 15 minutes

---

## Next Steps

1. **Run Postman tests** to verify all endpoints work
2. **Check audit report** at `.ai-workflow/PROJECT_AUDIT_REPORT.md`
3. **Review ownership validation** is working correctly
4. **Complete unit tests** for high-priority items
5. **Update Next.js** frontend (critical vulnerabilities)

---

**Happy testing!** 🚀
