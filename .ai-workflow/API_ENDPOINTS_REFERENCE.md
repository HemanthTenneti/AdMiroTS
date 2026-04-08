# API Endpoint Reference - Advertisements & Displays Modules

## Advertisements API (10 Endpoints)

### Create Advertisement
```http
POST /api/advertisements
Content-Type: application/json
Authorization: Bearer {token}

{
  "adName": "Summer Sale",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE",
  "duration": 30,
  "description": "50% off summer collection",
  "targetAudience": "18-35",
  "fileSize": 2048000
}

Response: 201
{
  "success": true,
  "data": {
    "id": "ad_abc123",
    "status": "DRAFT",
    "views": 0,
    "clicks": 0,
    "createdAt": "2026-04-09T..."
  }
}
```

### List Advertisements
```http
GET /api/advertisements?page=1&limit=10&status=ACTIVE&mediaType=IMAGE&sortBy=createdAt&sortOrder=desc

Response: 200
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "hasMore": true
    }
  }
}
```

### Get Advertisement
```http
GET /api/advertisements/:id

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Get Advertisement Statistics
```http
GET /api/advertisements/:id/stats

Response: 200
{
  "success": true,
  "data": {
    "id": "ad_abc123",
    "adName": "Summer Sale",
    "views": 1250,
    "clicks": 87,
    "clickThroughRate": 6.96,
    "displayCount": 5
  }
}
```

### Get Advertisements by User
```http
GET /api/advertisements/user/:userId

Response: 200
{
  "success": true,
  "data": [...]
}
```

### Update Advertisement
```http
PUT /api/advertisements/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "adName": "Summer Sale - Updated",
  "duration": 45
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Activate Advertisement
```http
POST /api/advertisements/:id/activate
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "data": {
    "status": "ACTIVE"
  }
}
```

### Deactivate Advertisement
```http
POST /api/advertisements/:id/deactivate
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "data": {
    "status": "PAUSED"
  }
}
```

### Delete Advertisement
```http
DELETE /api/advertisements/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "data": {
    "message": "Advertisement deleted successfully"
  }
}
```

### Bulk Upload Advertisements
```http
POST /api/advertisements/bulk-upload
Content-Type: application/json
Authorization: Bearer {token}

{
  "advertisements": [
    {
      "adName": "Ad 1",
      "mediaUrl": "...",
      "mediaType": "IMAGE",
      "duration": 30
    },
    {
      "adName": "Ad 2",
      "mediaUrl": "...",
      "mediaType": "VIDEO",
      "duration": 60
    }
  ]
}

Response: 201
{
  "success": true,
  "data": {
    "count": 2,
    "advertisements": [...]
  }
}
```

---

## Displays API (12 Endpoints)

### Create Display
```http
POST /api/displays
Content-Type: application/json
Authorization: Bearer {token}

{
  "displayId": "DISPLAY_001",
  "location": "Main Hall",
  "layout": "LANDSCAPE",
  "resolution": {
    "width": 1920,
    "height": 1080
  },
  "configuration": {
    "brightness": 100,
    "volume": 50,
    "refreshRate": 60,
    "orientation": "LANDSCAPE"
  },
  "serialNumber": "SN123456789"
}

Response: 201
{
  "success": true,
  "data": {
    "id": "disp_xyz789",
    "status": "OFFLINE",
    "connectionToken": "token-disp_xyz789",
    "createdAt": "2026-04-09T..."
  }
}
```

### List Displays
```http
GET /api/displays?page=1&limit=10&status=ONLINE&location=Main%20Hall&sortBy=createdAt&sortOrder=desc

Response: 200
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "hasMore": true
    }
  }
}
```

### Get Display
```http
GET /api/displays/:id

Response: 200
{
  "success": true,
  "data": {
    "id": "disp_xyz789",
    "displayId": "DISPLAY_001",
    "status": "ONLINE",
    "isConnected": true,
    "lastSeen": "2026-04-09T10:30:00Z"
  }
}
```

### Get Display Status
```http
GET /api/displays/:id/status

Response: 200
{
  "success": true,
  "data": {
    "id": "disp_xyz789",
    "displayId": "DISPLAY_001",
    "status": "ONLINE",
    "lastSeen": "2026-04-09T10:30:00Z",
    "isOnline": true
  }
}
```

### Get Display Assigned Loops
```http
GET /api/displays/:id/loops

Response: 200
{
  "success": true,
  "data": {
    "displayId": "DISPLAY_001",
    "currentLoopId": "loop_abc123",
    "hasAssignedLoop": true
  }
}
```

### Get Displays by Location
```http
GET /api/displays/location/:location

Response: 200
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ]
}
```

### Update Display
```http
PUT /api/displays/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "location": "New Location",
  "configuration": {
    "brightness": 80
  }
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Delete Display
```http
DELETE /api/displays/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "data": {
    "message": "Display deleted successfully"
  }
}
```

### Pair Display
```http
POST /api/displays/pair
Content-Type: application/json

{
  "serialNumber": "SN123456789"
}

Response: 201
{
  "success": true,
  "data": {
    "id": "disp_xyz789",
    "status": "ONLINE",
    "displayId": "DISPLAY_001"
  }
}
```

### Ping Display (Heartbeat)
```http
POST /api/displays/:id/ping

Response: 200
{
  "success": true,
  "data": {
    "message": "Ping received"
  }
}
```

### Update Display Configuration
```http
POST /api/displays/:id/config
Content-Type: application/json
Authorization: Bearer {token}

{
  "brightness": 85,
  "volume": 60,
  "refreshRate": 60,
  "orientation": "LANDSCAPE"
}

Response: 200
{
  "success": true,
  "data": {
    "configuration": {
      "brightness": 85,
      "volume": 60,
      "refreshRate": 60,
      "orientation": "LANDSCAPE"
    }
  }
}
```

---

## Error Responses

### Validation Error
```http
400 Bad Request

{
  "success": false,
  "error": "Validation failed",
  "message": "Ad name cannot exceed 255 characters"
}
```

### Not Found Error
```http
404 Not Found

{
  "success": false,
  "error": "NotFound",
  "message": "Advertisement with ID abc123 not found"
}
```

### Conflict Error
```http
409 Conflict

{
  "success": false,
  "error": "Conflict",
  "message": "Display with this serial number already exists"
}
```

### Unauthorized Error
```http
401 Unauthorized

{
  "success": false,
  "error": "Unauthorized",
  "message": "User not authenticated"
}
```

---

## Query Parameters

### Pagination
- `page`: number (default: 1, min: 1)
- `limit`: number (default: 10, min: 1, max: 100)

### Advertisement Filters
- `status`: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED"
- `mediaType`: "IMAGE" | "VIDEO"
- `advertiserId`: UUID of the advertiser
- `sortBy`: "createdAt" | "updatedAt" | "adName" | "views" | "clicks" | "duration"
- `sortOrder`: "asc" | "desc" (default: "desc")

### Display Filters
- `status`: "ONLINE" | "OFFLINE" | "INACTIVE"
- `location`: string (location name)
- `layout`: "LANDSCAPE" | "PORTRAIT"
- `sortBy`: "createdAt" | "updatedAt" | "displayId" | "location" | "status"
- `sortOrder`: "asc" | "desc" (default: "desc")

---

## Authentication

All endpoints marked with ✅ require JWT authentication:
```http
Authorization: Bearer {jwt_token}
```

Token obtained via:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

---

## Rate Limiting

- **General endpoints**: 20 requests/minute per IP
- **Public data endpoints** (list operations): 20 requests/minute per IP
- **Auth endpoints**: 5 failed attempts → 5+ minute lockout (exponential backoff)

---

## Content-Type

All POST/PUT requests require:
```http
Content-Type: application/json
```

---

## Status Codes

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing/invalid auth token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `500 Internal Server Error` - Server error
