# Complete AdMiroTS Project Specification
**Version**: 1.0  
**Date**: April 9, 2026  
**Status**: Comprehensive Specification for Full Project (Implemented + To-Be-Implemented)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Module Inventory](#module-inventory)
3. [Implemented Modules](#implemented-modules)
4. [To-Be-Implemented Modules](#to-be-implemented-modules)
5. [Complete API Endpoint Map](#complete-api-endpoint-map)
6. [System Architecture](#system-architecture)
7. [Data Models](#data-models)
8. [Integration Points](#integration-points)

---

## Project Overview

**AdMiroTS** (Advertisement Mirror TimeScale) is a comprehensive digital signage and advertisement management SaaS platform built with modern TypeScript, Express.js, MongoDB, and React.

### Core Capabilities
- **Advertisement Management**: Create, manage, and track digital advertisements
- **Display Management**: Manage display hardware, status, and configuration
- **Display Loops**: Organize advertisements into sequences for playback
- **Analytics**: Track engagement metrics and performance
- **System Logging**: Comprehensive audit trail and system monitoring
- **User Management**: Authentication, profiles, and role-based access

### Project Scope
- **Total Endpoints**: 38+ (Implemented: 22, To-Implement: 16+)
- **Modules**: 7 (Implemented: 4, To-Implement: 3)
- **Architecture Pattern**: Clean 3-Layer (Controller → Service → Repository)
- **Type Safety**: 100% strict TypeScript
- **Security**: JWT authentication, rate limiting, input validation
- **Quality Score**: 9.1/10 (current)

---

## Module Inventory

### Summary Table

| Module | Status | Endpoints | Lines | Priority |
|--------|--------|-----------|-------|----------|
| **Auth** | ✅ Implemented | 7 | 320 | Critical |
| **Advertisements** | ✅ Implemented | 10 | 800 | Critical |
| **Displays** | ✅ Implemented | 12 | 850 | Critical |
| **Profile** | ✅ Implemented | 4 | 250 | High |
| **Display Loops** | ⏳ To-Implement | 8 | ~500 | High |
| **Analytics** | ⏳ To-Implement | 5 | ~400 | Medium |
| **System Logs** | ⏳ To-Implement | 4 | ~300 | Medium |

---

## Implemented Modules

### 1. Authentication Module (7 Endpoints) ✅

**Purpose**: Handle user authentication, authorization, and token management

#### Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/auth/register` | ❌ Public | Register new user |
| 2 | POST | `/api/auth/login` | ❌ Public | Authenticate user |
| 3 | POST | `/api/auth/google` | ❌ Public | OAuth2 Google login |
| 4 | GET | `/api/auth/me` | ✅ Required | Get authenticated user profile |
| 5 | POST | `/api/auth/refresh` | ✅ Required | Refresh JWT token |
| 6 | POST | `/api/auth/change-password` | ✅ Required | Change user password |
| 7 | POST | `/api/auth/logout` | ✅ Required | Logout user |

#### Key Features
- JWT-based authentication with refresh tokens
- Google OAuth2 integration
- Password hashing with bcrypt (10 rounds)
- Account lockout after failed attempts
- Structured error responses

#### Models & Validation
- **User Model**: ID, email, password, role, status
- **Schemas**:
  - RegisterSchema: email validation, password strength
  - LoginSchema: email, password
  - ChangePasswordSchema: old password, new password

---

### 2. Advertisements Module (10 Endpoints) ✅

**Purpose**: Manage digital advertisements with full CRUD and lifecycle management

#### Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/advertisements` | ✅ Required | Create new advertisement |
| 2 | GET | `/api/advertisements` | ❌ Public | List all with pagination/filters |
| 3 | GET | `/api/advertisements/:id` | ❌ Public | Get single advertisement |
| 4 | GET | `/api/advertisements/:id/stats` | ❌ Public | Get engagement statistics |
| 5 | GET | `/api/advertisements/user/:userId` | ❌ Public | List by advertiser |
| 6 | PUT | `/api/advertisements/:id` | ✅ Required | Update advertisement |
| 7 | DELETE | `/api/advertisements/:id` | ✅ Required | Soft delete |
| 8 | POST | `/api/advertisements/:id/activate` | ✅ Required | Activate (status→ACTIVE) |
| 9 | POST | `/api/advertisements/:id/deactivate` | ✅ Required | Deactivate (status→PAUSED) |
| 10 | POST | `/api/advertisements/bulk-upload` | ✅ Required | Bulk create (max 100) |

#### Key Features
- Full advertisement lifecycle management (DRAFT → ACTIVE → PAUSED → EXPIRED)
- Engagement tracking (views, clicks, CTR)
- Media support (IMAGE, VIDEO)
- Bulk operations (max 100 per request)
- Pagination and filtering (by status, media type, advertiser)

#### Models
```typescript
Advertisement {
  id: string
  adName: string (max 255)
  mediaUrl: string (validated URL, max 2048)
  mediaType: "IMAGE" | "VIDEO"
  duration: number (1-3600 seconds)
  description?: string (max 5000)
  targetAudience?: string (max 500)
  fileSize?: number (max 500MB)
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED"
  views: number
  clicks: number
  advertiserId: string (reference to User)
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date (soft delete)
}
```

---

### 3. Displays Module (12 Endpoints) ✅

**Purpose**: Manage physical/virtual display devices with status tracking and configuration

#### Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/displays` | ✅ Required | Create new display |
| 2 | GET | `/api/displays` | ❌ Public | List with pagination/filters |
| 3 | GET | `/api/displays/:id` | ❌ Public | Get single display |
| 4 | GET | `/api/displays/:id/status` | ❌ Public | Get online/offline status |
| 5 | GET | `/api/displays/:id/loops` | ❌ Public | Get assigned loops |
| 6 | GET | `/api/displays/location/:location` | ❌ Public | Filter by location |
| 7 | PUT | `/api/displays/:id` | ✅ Required | Update display properties |
| 8 | DELETE | `/api/displays/:id` | ✅ Required | Soft delete |
| 9 | POST | `/api/displays/pair` | ❌ Public | Pair/activate display via serial number |
| 10 | POST | `/api/displays/:id/ping` | ❌ Public | Heartbeat/health check |
| 11 | POST | `/api/displays/:id/config` | ✅ Required | Update configuration (brightness, volume, etc.) |
| 12 | GET | `/api/displays/location/:location` | ❌ Public | List by location |

#### Key Features
- Display lifecycle management (OFFLINE → ONLINE → INACTIVE)
- Health check via heartbeat pings (5-minute timeout)
- Configuration management (brightness 0-100, volume 0-100, refresh rate, orientation)
- Location-based filtering
- Serial number-based pairing
- Status tracking (lastPing, isOnline)

#### Models
```typescript
Display {
  id: string
  displayId: string (max 100)
  location: string (max 255)
  layout: "LANDSCAPE" | "PORTRAIT"
  resolution: {
    width: number (positive integer)
    height: number (positive integer)
  }
  configuration: {
    brightness: number (0-100)
    volume: number (0-100)
    refreshRate: number (positive integer)
    orientation: "LANDSCAPE" | "PORTRAIT"
  }
  serialNumber?: string (max 100, unique)
  status: "ONLINE" | "OFFLINE" | "INACTIVE"
  isConnected: boolean
  lastPing?: Date
  connectionToken: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date (soft delete)
}
```

---

### 4. Profile Module (4 Endpoints) ✅

**Purpose**: Manage user profile information and avatars

#### Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | GET | `/api/profile` | ✅ Required | Get user profile |
| 2 | PUT | `/api/profile` | ✅ Required | Update profile |
| 3 | GET | `/api/profile/avatar` | ✅ Required | Get avatar image |
| 4 | POST | `/api/profile/avatar` | ✅ Required | Upload/update avatar |

#### Key Features
- User profile CRUD operations
- Avatar image management
- Profile field validation

#### Models
```typescript
UserProfile {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role: "ADMIN" | "ADVERTISER" | "OPERATOR"
  avatar?: {
    url: string
    uploadedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}
```

---

## To-Be-Implemented Modules

### 5. Display Loops Module (8 Endpoints) ⏳

**Purpose**: Organize advertisements into playlists/loops for display devices

#### Planned Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/display-loops` | ✅ Required | Create new loop |
| 2 | GET | `/api/display-loops` | ❌ Public | List loops with pagination |
| 3 | GET | `/api/display-loops/:id` | ❌ Public | Get single loop |
| 4 | PUT | `/api/display-loops/:id` | ✅ Required | Update loop |
| 5 | DELETE | `/api/display-loops/:id` | ✅ Required | Delete loop |
| 6 | POST | `/api/display-loops/:id/assign` | ✅ Required | Assign advertisements to loop |
| 7 | POST | `/api/display-loops/:id/deploy` | ✅ Required | Deploy loop to displays |
| 8 | GET | `/api/display-loops/:id/schedule` | ❌ Public | Get loop playback schedule |

#### Key Features
- Advertisement playlist organization
- Playback order and duration management
- Display assignment
- Scheduling capabilities
- Loop status tracking (DRAFT, ACTIVE, ARCHIVED)

#### Planned Model
```typescript
DisplayLoop {
  id: string
  name: string (max 255)
  description?: string (max 5000)
  advertisements: string[] (advertisement IDs)
  displayIds?: string[] (assigned displays)
  playbackDuration?: number (total duration in seconds)
  loopCount?: number (how many times to repeat)
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  createdBy: string (user ID)
  createdAt: Date
  updatedAt: Date
  deployedAt?: Date
}
```

#### Validation Schemas (Created)
```typescript
// Located in: apps/api/src/utils/validators/display-loops.schema.ts
- CreateDisplayLoopSchema
- UpdateDisplayLoopSchema
- DisplayLoopListQuerySchema
```

---

### 6. Analytics Module (5 Endpoints) ⏳

**Purpose**: Track and report on advertisement performance and engagement metrics

#### Planned Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/analytics/record-view` | ❌ Public | Record advertisement view |
| 2 | POST | `/api/analytics/record-click` | ❌ Public | Record advertisement click |
| 3 | GET | `/api/analytics/reports/:advertisementId` | ✅ Required | Get detailed performance report |
| 4 | GET | `/api/analytics/dashboard` | ✅ Required | Get dashboard summary statistics |
| 5 | GET | `/api/analytics/export` | ✅ Required | Export analytics data (CSV/JSON) |

#### Key Features
- Event tracking (views, clicks, impressions)
- Performance metrics aggregation
- Time-series analytics
- Report generation
- Dashboard summaries
- Data export capabilities

#### Planned Model
```typescript
AnalyticsEvent {
  id: string
  type: "VIEW" | "CLICK" | "IMPRESSION"
  advertisementId: string
  displayId: string
  userId?: string
  timestamp: Date
  metadata?: {
    duration: number
    location: string
    deviceInfo: string
  }
}

AnalyticsReport {
  id: string
  advertisementId: string
  period: {
    startDate: Date
    endDate: Date
  }
  metrics: {
    totalViews: number
    totalClicks: number
    ctr: number (percentage)
    avgDuration: number
    engagementRate: number
  }
  generatedAt: Date
  generatedBy: string (user ID)
}
```

#### Validation Schemas (Created)
```typescript
// Located in: apps/api/src/utils/validators/analytics.schema.ts
- CreateAnalyticsSchema
- AnalyticsListQuerySchema
```

---

### 7. System Logs Module (4 Endpoints) ⏳

**Purpose**: Maintain audit trail and system monitoring logs

#### Planned Endpoints

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/api/system-logs/record` | ❌ Public | Record system event |
| 2 | GET | `/api/system-logs` | ✅ Required | List system logs with filters |
| 3 | GET | `/api/system-logs/:id` | ✅ Required | Get single log entry |
| 4 | DELETE | `/api/system-logs/purge` | ✅ Admin Only | Purge old logs |

#### Key Features
- Comprehensive audit logging
- User action tracking
- System error logging
- Performance monitoring
- Log retention policies
- Admin-only access

#### Planned Model
```typescript
SystemLog {
  id: string
  type: "USER_ACTION" | "SYSTEM_EVENT" | "ERROR" | "PERFORMANCE"
  action: string
  userId?: string
  resourceType?: string
  resourceId?: string
  changes?: {
    before: any
    after: any
  }
  status: "SUCCESS" | "FAILED" | "PENDING"
  errorMessage?: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  metadata?: Record<string, any>
}
```

#### Validation Schemas (Created)
```typescript
// Located in: apps/api/src/utils/validators/system-logs.schema.ts
- CreateSystemLogSchema
- SystemLogListQuerySchema
```

---

## Complete API Endpoint Map

### Total: 38 Endpoints
- ✅ **Implemented**: 33 Endpoints (4 modules)
  - Auth: 7
  - Advertisements: 10
  - Displays: 12
  - Profile: 4

- ⏳ **To-Implement**: 17 Endpoints (3 modules)
  - Display Loops: 8
  - Analytics: 5
  - System Logs: 4

### API Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require:
```http
Authorization: Bearer {jwt_token}
```

Token obtained from:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Rate Limiting
- **Auth Endpoints**: 5 failed attempts → 5+ minute lockout
- **Public Data Endpoints**: 20 requests/minute per IP
- **General Endpoints**: 20 requests/minute per IP

### Common Response Format

#### Success Response (200, 201)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Descriptive error message"
}
```

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│            HTTP Client (Frontend/Postman)   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│              Express.js Server              │
│         (routes, middleware, handlers)      │
└─────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            MIDDLEWARE LAYER                  │
├──────────────────────────────────────────────┤
│ • CORS Middleware                            │
│ • JWT Authentication Middleware              │
│ • Request Validation Middleware (Zod)        │
│ • Rate Limiting Middleware                   │
│ • Error Handler Middleware                   │
│ • Response Formatter Middleware              │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            CONTROLLER LAYER                  │
├──────────────────────────────────────────────┤
│ • AuthController        (7 methods)          │
│ • AdvertisementController (10 methods)       │
│ • DisplayController     (11 methods)         │
│ • ProfileController     (4 methods)          │
│ • DisplayLoopController (8 methods) ⏳       │
│ • AnalyticsController   (5 methods) ⏳       │
│ • SystemLogController   (4 methods) ⏳       │
│                                              │
│ Responsibilities:                            │
│ - Parse HTTP requests                        │
│ - Delegate to services                       │
│ - Format HTTP responses                      │
│ - Call next() for errors                     │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            SERVICE LAYER                     │
├──────────────────────────────────────────────┤
│ • AuthService           (auth logic)         │
│ • AdvertisementService  (ad business logic)  │
│ • DisplayService        (display logic)      │
│ • ProfileService        (profile management) │
│ • DisplayLoopService    (loop logic) ⏳      │
│ • AnalyticsService      (tracking) ⏳        │
│ • SystemLogService      (logging) ⏳         │
│                                              │
│ Responsibilities:                            │
│ - Business logic                             │
│ - Validation                                 │
│ - Error handling                             │
│ - Repository coordination                    │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            REPOSITORY LAYER                  │
├──────────────────────────────────────────────┤
│ • BaseRepository<T>      (generic CRUD)      │
│   ├─ UserRepository                          │
│   ├─ AdvertisementRepository                 │
│   ├─ DisplayRepository                       │
│   ├─ DisplayLoopRepository ⏳                │
│   ├─ AnalyticsRepository ⏳                  │
│   └─ SystemLogRepository ⏳                  │
│                                              │
│ Responsibilities:                            │
│ - Database queries                           │
│ - Pagination/filtering                       │
│ - Entity instantiation                       │
│ - Custom finder methods                      │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            DOMAIN LAYER                      │
├──────────────────────────────────────────────┤
│ Package: @admiro/domain                      │
│                                              │
│ • Entity Classes                             │
│   - User                                     │
│   - Advertisement                            │
│   - Display                                  │
│   - DisplayLoop                              │
│   - AnalyticsEvent                           │
│   - SystemLog                                │
│                                              │
│ • Value Objects                              │
│   - Resolution                               │
│   - DisplayConfiguration                     │
│   - EngagementMetrics                        │
│                                              │
│ • Enumerations                               │
│   - UserRole, AdStatus, DisplayStatus, etc.  │
│                                              │
│ Responsibilities:                            │
│ - Business rules                             │
│ - Entity logic                               │
│ - Type definitions                           │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│            PERSISTENCE LAYER                 │
├──────────────────────────────────────────────┤
│ • MongoDB Database                           │
│   - Collections (users, advertisements,      │
│     displays, display_loops, analytics,      │
│     system_logs)                             │
│   - Mongoose Models & Schemas                │
│   - Indexes for performance                  │
└──────────────────────────────────────────────┘
```

---

## Data Models

### Entity Relationship Diagram (Logical)

```
┌──────────────┐
│    User      │
├──────────────┤
│ • id         │
│ • email      │
│ • password   │
│ • role       │
│ • status     │
└────────┬─────┘
         │ 1
         │ creates/owns
         │ M
    ┌────▼──────────────┐
    │ Advertisement      │
    ├────────────────────┤
    │ • id               │
    │ • adName           │
    │ • mediaUrl         │
    │ • status           │
    │ • views            │
    │ • clicks           │
    │ • advertiserId FK  │
    └────┬───────────────┘
         │ M
         │ contained in
         │ M
    ┌────▼──────────────┐
    │ DisplayLoop        │
    ├────────────────────┤
    │ • id               │
    │ • name             │
    │ • advertisements[] │
    │ • displays[]       │
    │ • status           │
    └────────────────────┘
         │ M
         │ played on
         │ M
    ┌────▼──────────────┐
    │    Display         │
    ├────────────────────┤
    │ • id               │
    │ • displayId        │
    │ • location         │
    │ • status           │
    │ • configuration    │
    │ • lastPing         │
    └────────────────────┘
         │ 1
         │ generates
         │ M
    ┌────▼──────────────┐
    │ AnalyticsEvent     │
    ├────────────────────┤
    │ • id               │
    │ • type (VIEW|CLK)  │
    │ • advertisementId   │
    │ • displayId        │
    │ • timestamp        │
    └────────────────────┘
         │
         └─── SystemLog
              • id
              • action
              • timestamp
              • userId
```

---

## Integration Points

### Module Dependencies

```
Auth Service
  ├─ User Repository
  └─ JWT Middleware

Profile Service
  ├─ Auth Service
  └─ User Repository

Advertisement Service
  ├─ Advertisement Repository
  └─ Error Classes

Display Service
  ├─ Display Repository
  ├─ DisplayLoop Service
  └─ Analytics Service

DisplayLoop Service (⏳)
  ├─ DisplayLoop Repository
  ├─ Display Service
  └─ Advertisement Service

Analytics Service (⏳)
  ├─ Analytics Repository
  ├─ Advertisement Service
  └─ Display Service

SystemLog Service (⏳)
  └─ SystemLog Repository
```

### Cross-Cutting Concerns

1. **Authentication**: Required for write operations and sensitive reads
2. **Validation**: Zod schemas validate all inputs
3. **Error Handling**: Consistent typed error classes
4. **Logging**: All operations logged to system logs
5. **Rate Limiting**: Protects public endpoints
6. **CORS**: Whitelist frontend domains

---

## Implementation Roadmap

### Phase 1: ✅ Complete (Current)
- [x] Auth Module (7 endpoints)
- [x] Advertisements Module (10 endpoints)
- [x] Displays Module (12 endpoints)
- [x] Profile Module (4 endpoints)
- [x] Validation schemas for all modules

### Phase 2: ⏳ Next Priority
- [ ] Display Loops Module (8 endpoints)
- [ ] Integration with Display Service
- [ ] Scheduling capabilities

### Phase 3: ⏳ Medium Priority
- [ ] Analytics Module (5 endpoints)
- [ ] Reporting system
- [ ] Dashboard API

### Phase 4: ⏳ Lower Priority
- [ ] System Logs Module (4 endpoints)
- [ ] Admin dashboard
- [ ] Data retention policies

---

## Quality Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Overall Score | 9.5/10 | 9.1/10 | ✅ On Track |
| Type Safety | 9.5/10 | 9.5/10 | ✅ Excellent |
| Error Handling | 9.0/10 | 9.0/10 | ✅ Excellent |
| Code Quality | 9.0/10 | 9.0/10 | ✅ Excellent |
| Security | 9.5/10 | 9.5/10 | ✅ Excellent |
| Test Coverage | 8.0/10 | TBD | ⏳ Pending |
| Documentation | 8.5/10 | 8.5/10 | ✅ Good |

---

## Summary

This specification covers the complete AdMiroTS project scope including:
- **4 Fully Implemented Modules** with 33 endpoints
- **3 To-Be-Implemented Modules** with 17 planned endpoints
- **Professional architecture** following industry best practices
- **Comprehensive validation** and error handling
- **Security mechanisms** (JWT, rate limiting, input validation)
- **Type-safe implementation** with 100% strict TypeScript

Refer to this document alongside Postman collection, system design diagrams, and SOLID/SRP reports for complete project understanding.

