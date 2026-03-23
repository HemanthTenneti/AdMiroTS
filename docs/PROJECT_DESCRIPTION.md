# AdMiro - Digital Advertisement Management System

A comprehensive, full-stack **Software as a Service (SaaS)** platform for managing digital displays and advertisements in real-time. AdMiro allows businesses to create, organize, distribute, and track advertisements across multiple display devices with real-time synchronization and advanced analytics.
**Current Status:** Original JavaScript/Node.js + Next.js version
**Objective:** Recreate as TypeScript-based application with proper type safety, classes, interfaces, and ER diagrams for client presentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Database Models & ER Diagram](#database-models--er-diagram)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Validation Rules](#validation-rules)
10. [Middleware & Services](#middleware--services)
11. [Configuration & Environment](#configuration--environment)
12. [Frontend Components](#frontend-components)
13. [Deployment Architecture](#deployment-architecture)
14. [Setup Instructions](#setup-instructions)

---

## Project Overview

### What is AdMiro?

AdMiro is a digital display management platform that enables organizations to:

- **Create and manage** digital advertisements (images and videos)
- **Control multiple display devices** (physical screens, digital signs, kiosks)
- **Create custom playlists** (loops) of advertisements
- **Real-time synchronization** - All displays update simultaneously
- **Track engagement metrics** - Impressions, clicks, dwell time
- **Audit activity** - Complete logging of all system actions
- **Multi-user management** - Admin and Advertiser roles with role-based access control

### Use Cases

- **Retail Stores** - Display promotions and product information on in-store screens
- **Transportation Hubs** - Manage advertisements across multiple kiosks and displays
- **Corporate Offices** - Internal communications and announcements
- **Shopping Malls** - Coordinated advertisement campaigns across multiple locations
- **Educational Institutions** - Digital signage for campus announcements

### Key Statistics

- **Backend Code:** ~5,841 lines
- **Frontend Code:** ~12,233 lines
- **Total Codebase:** ~18,074 lines
- **API Endpoints:** 50+ REST endpoints
- **Database Models:** 7 MongoDB collections
- **Middleware Components:** 10+
- **Pages:** 17 (public + protected + display client)

---

## Architecture

### High-Level Architecture

┌─────────────────────────┐
│ Client/Browser │
│ - Dashboard Admin │
│ - Display Client │
└────────────┬────────────┘
│ HTTP/REST
│
┌────────────▼────────────────────────────┐
│ Backend API Server (Express.js) │
│ ├─ Authentication & Authorization │
│ ├─ Business Logic Controllers │
│ ├─ Data Validation & Sanitization │
│ ├─ Middleware Pipeline │
│ └─ Logging & Analytics │
└────────────┬────────────────────────────┘
│ Database Queries
│
┌────────────▼────────────┐
│ MongoDB Database │
│ - 7 Collections │
│ - Indexes & Queries │
└─────────────────────────┘

### Application Flow

User Registration/Login
↓
JWT Token Generated
↓
Create Advertisements (Upload Images/Videos)
↓
Create Display Devices
↓
Create Display Loops (Playlists)

- Assign Advertisements to Loop
- Set Rotation Type (Sequential/Random)
- Set Display Layout (Fullscreen/Masonry)
  ↓
  Assign Loop to Display
  ↓
  Display Client (Browser)
  ↓
  Fetch Loop & Advertisements
  ↓
  Play Advertisements
  ↓
  Poll Server Every 30 Seconds for Updates
  ↓
  Report Status & Metrics Back to Server
  ↓
  Analytics Engine Tracks Engagement

---

## Technology Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) + Google OAuth 2.0
- **Password Hashing:** bcryptjs
- **File Upload:** Multer (in-memory)
- **Validation:** express-validator
- **Security:** Helmet.js, CORS, Rate Limiting
- **Logging:** Morgan, Custom Logging Service
- **ID Generation:** UUID
- **Session Management:** express-session with Passport.js

### Frontend

- **Framework:** Next.js 16 (React 19)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP (GreenSock Animation Platform)
- **Icons:** Phosphor React
- **Notifications:** Sonner (Toast)
- **Build Tool:** Webpack (Next.js bundler)

### Database

- **Primary:** MongoDB Atlas (Cloud) / Local MongoDB
- **ODM:** Mongoose 8.19.3
- **Data Format:** JSON/BSON

### DevOps & Deployment

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render / Railway / Heroku
- **Version Control:** Git
- **Package Manager:** npm/yarn

---

## Project Structure

### Backend Structure

AdMiroBackend/
├── src/
│ ├── config/ # Configuration files
│ │ ├── constants.js # App enums, roles, statuses
│ │ ├── database.js # MongoDB connection
│ │ ├── passport.js # Passport OAuth config
│ │ └── s3.js # AWS S3 config (optional)
│ │
│ ├── controllers/ # Business logic (7 controllers)
│ │ ├── authController.js
│ │ ├── advertisementsController.js
│ │ ├── displaysController.js
│ │ ├── displayLoopsController.js
│ │ ├── profileController.js
│ │ ├── logsController.js
│ │ └── analyticsController.js
│ │
│ ├── models/ # MongoDB Schemas (7 models)
│ │ ├── User.js
│ │ ├── Advertisement.js
│ │ ├── Display.js
│ │ ├── DisplayLoop.js
│ │ ├── SystemLog.js
│ │ ├── Analytics.js
│ │ └── DisplayConnectionRequest.js
│ │
│ ├── routes/ # API endpoints (8 route files)
│ │ ├── index.js
│ │ ├── authRoutes.js
│ │ ├── advertisementsRoutes.js
│ │ ├── displaysRoutes.js
│ │ ├── loopsRoutes.js
│ │ ├── profileRoutes.js
│ │ ├── logsRoutes.js
│ │ ├── analyticsRoutes.js
│ │ └── googleAuthRoutes.js
│ │
│ ├── middleware/ # Express middleware (10 files)
│ │ ├── auth.js # JWT verification
│ │ ├── cors.js # CORS configuration
│ │ ├── errorHandler.js # Global error handling
│ │ ├── logger.js # Request logging
│ │ ├── rateLimiter.js # Rate limiting
│ │ └── upload.js # File upload handling
│ │
│ ├── services/ # Reusable business logic
│ │ ├── authService.js # Auth operations
│ │ └── loggingService.js # Audit logging
│ │
│ ├── utils/
│ │ └── helpers.js # Helper functions
│ │
│ ├── scripts/ # Database utility scripts
│ │ ├── clearSystemLogs.js
│ │ ├── dropMacAddressIndex.js
│ │ ├── dropOldIndexes.js
│ │ └── wipeDatabase.js
│ │
│ └── server.js # Express app entry point
│
├── .env.example # Environment variables template
├── .gitignore
├── package.json
└── README.md

### Frontend Structure

AdMiroFrontend/
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── page.js # Landing page (/)
│ │ ├── layout.js # Root layout
│ │ │
│ │ ├── login/
│ │ │ └── page.js # Login/Register
│ │ │
│ │ ├── auth-callback/
│ │ │ └── page.js # Google OAuth callback
│ │ │
│ │ ├── dashboard/ # Protected routes
│ │ │ ├── page.js # Dashboard home
│ │ │ ├── ads/ # Advertisement CRUD
│ │ │ │ ├── page.js
│ │ │ │ ├── new/page.js
│ │ │ │ └── id/
│ │ │ │ ├── page.js
│ │ │ │ └── edit/page.js
│ │ │ │
│ │ │ ├── displays/ # Display CRUD
│ │ │ │ ├── page.js
│ │ │ │ ├── new/page.js
│ │ │ │ └── id/
│ │ │ │ ├── page.js
│ │ │ │ ├── edit/page.js
│ │ │ │ └── loops/ # Loop management per display
│ │ │ │ ├── page.js
│ │ │ │ ├── new/page.js
│ │ │ │ └── loopId/edit/page.js
│ │ │ │
│ │ │ ├── loops/ # Global loop management
│ │ │ │ ├── page.js
│ │ │ │ └── new/page.js
│ │ │ │
│ │ │ ├── logs/ # Activity logs
│ │ │ │ └── page.js
│ │ │ │
│ │ │ ├── analytics/ # Analytics dashboard
│ │ │ │ └── page.js
│ │ │ │
│ │ │ ├── profile/ # User profile
│ │ │ │ └── page.js
│ │ │ │
│ │ │ └── connection-requests/
│ │ │ └── page.js
│ │ │
│ │ ├── display/ # Public display playback
│ │ │ └── page.js
│ │ │
│ │ ├── display-login/ # Display authentication
│ │ │ └── page.js
│ │ │
│ │ └── display-register/ # Display registration
│ │ └── page.js
│ │
│ ├── components/ # Reusable React components
│ │ ├── DashboardLayout.jsx
│ │ ├── DisplayForm.jsx
│ │ ├── PageTransition.jsx
│ │ ├── ScrollToTop.jsx
│ │ ├── ThemeProvider.jsx
│ │ └── ToastProvider.jsx
│ │
│ ├── context/ # Zustand state management
│ │ └── authStore.js # Auth store
│ │
│ ├── hooks/ # Custom React hooks
│ │ └── useAnimations.js
│ │
│ ├── lib/ # Utilities
│ │ ├── api.js # Axios instance
│ │ ├── axiosConfig.js
│ │ ├── theme.js
│ │ └── utils.js
│ │
│ ├── constants/
│ │ └── routes.js # Route constants
│ │
│ └── public/ # Static assets
│
├── .env.example
├── .gitignore
├── package.json
├── jsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.js
└── README.md

---

## Core Features

### 1. Display Management System

#### Create & Register Displays

- **Browser-Based Displays:** Register any browser as a display device
- **Physical Displays:** Support for physical devices with connection tokens
- **Auto-Generated Tokens:** Unique 36-character UUID for secure communication
- **Display Properties:**
  - Display ID (3+ characters, unique)
  - Display Name
  - Location
  - Resolution (default: 1920x1080)
  - Configuration: Brightness, Volume, Refresh Rate, Orientation
  - Optional Password Protection

#### Display Status Monitoring

- **Status Types:** Online, Offline, Inactive
- **Real-time Tracking:** Last seen timestamp updated on heartbeat
- **Connection Requests:** Approve/reject new device connections
- **Refresh Control:** Trigger immediate content refresh on displays

#### Configuration Management

- **Brightness:** 0-100% adjustable
- **Volume:** 0-100% adjustable
- **Refresh Rate:** Configurable Hz
- **Orientation:** Portrait or Landscape mode

---

### 2. Advertisement Management

#### Create Advertisements

- **Media Types Supported:**
  - **Images:** JPEG, PNG, GIF, WebP
  - **Videos:** MP4, MOV, AVI
- **Upload Methods:**
  - Direct File Upload (max 100MB)
  - External URL/Link (stored as reference)
  - Auto Base64 Encoding (serverless-compatible storage)

#### Advertisement Properties

- **Required Fields:**
  - Ad Name (3+ characters)
  - Media Type (image/video)
  - Duration (1-300 seconds)
  - Media (file or URL)
- **Optional Fields:**
  - Description (max 500 characters)
  - Target Audience
  - Thumbnail URL (auto-generated for images)

#### Advertisement Status Tracking

- **Status Options:** Active, Scheduled, Paused, Expired, Draft
- **Metadata:** View count, Click count, File size
- **Timestamps:** Created at, Last updated

#### Media Features

- **Auto Thumbnail:** Generated for images
- **Base64 Encoding:** Converted for database storage
- **Size Validation:** 100MB max for media files
- **Format Validation:** Automatic MIME type checking

---

### 3. Display Loop System (Playlists)

#### Loop Creation & Management

- **Playlist Creation:** Group multiple ads into custom loops
- **Ad Ordering:** Drag-and-drop reordering interface
- **Loop Properties:**
  - Loop Name (3+ characters, required)
  - Description (max 500 characters)
  - Associated Display
  - Rotation Type
  - Display Layout

#### Rotation Types

- **Sequential:** Play ads one after another in order
- **Random:** Shuffle ad playback order
- **Weighted:** Priority-based rotation (future enhancement)

#### Display Layouts

- **Fullscreen:** Single advertisement fills entire screen
- **Masonry:** Multiple ads displayed in grid layout

#### Duration Calculation

- **Total Loop Duration:** Auto-calculated sum of all ad durations
- **Loop Cycle Time:** How long until loop repeats

#### Loop Assignment

- **Single-Click Assignment:** Assign to display immediately
- **Real-time Sync:** 30-second polling keeps display updated
- **Immediate Playback:** Loop starts on assigned display within 30 seconds

---

### 4. Authentication & Authorization

#### User Registration

- **Registration Fields:**
  - Username (3-30 characters, unique, alphanumeric + underscore)
  - Email (valid format, unique)
  - Password (6+ characters, hashed with bcryptjs)
  - First Name (optional)
  - Last Name (optional)
- **Password Security:**
  - 10-round bcryptjs hashing
  - Password confirmation required
  - Stored securely (excluded from responses)

#### User Login

- **Methods:**
  - Credentials: Username or Email + Password
  - Google OAuth 2.0 (social login)
- **JWT Tokens Generated:**
  - Access Token (7-day expiry)
  - Refresh Token (30-day expiry)

#### Google OAuth Integration

- **Google Cloud Setup Required**
- **User Creation/Update:** First login creates account
- **Profile Data:** Email, Name, Profile Picture extracted
- **Session Management:** Automatic user session establishment

#### Role-Based Access Control (RBAC)

- **Admin Role:**
  - Full system access
  - Approve/reject display connections
  - View all users' activities
  - Manage system logs
- **Advertiser Role:**
  - Create/manage own advertisements
  - Create/manage own displays
  - Assign loops to displays
  - View own activity logs
  - Cannot approve connections or manage other users

#### Token Management

- **Access Token Usage:**
  - Sent in Authorization header: `Bearer {token}`
  - 7-day expiration
  - Auto-refresh capability
- **Refresh Token Usage:**
  - Send to `/api/auth/refresh-token` endpoint
  - Gets new access token
  - 30-day expiration

---

### 5. Activity Logging & Audit Trail

#### What Gets Logged

- **Create Actions:** When ad/display/loop created
- **Update Actions:** When properties changed
- **Delete Actions:** When resource deleted
- **Status Changes:** When status updated
- **Custom Actions:** Auth events, approvals, etc.

#### Log Entry Details

- **Action Type:** create, update, delete, status_change, approve, reject
- **Entity Type:** advertisement, display, loop, user, system
- **Entity ID:** What was affected
- **User ID:** Who performed the action
- **Changes:** What was modified (before/after)
- **IP Address:** Request origin
- **User Agent:** Browser/client information
- **Timestamp:** When action occurred

#### Log Queries & Filtering

- **Filter by Action:** Show only create actions, updates, etc.
- **Filter by Entity:** Show only ad logs, display logs, etc.
- **Filter by User:** Show actions by specific user
- **Date Range:** Query logs between dates
- **Full-Text Search:** Search in description/changes
- **Pagination:** Handle large log sets
- **Sorting:** By timestamp, user, action type

#### Compliance & Audit

- **Complete History:** Every change tracked
- **Immutable Records:** Logs cannot be edited (only deleted by admin)
- **User Attribution:** Every action linked to user
- **Context Tracking:** Full details of what changed

---

### 6. User Profile Management

#### Profile Information

- **Displayable Fields:**
  - Username
  - Email
  - First Name
  - Last Name
  - Profile Picture (uploaded image)
  - Last Login Timestamp

#### Profile Features

- **Update Personal Info:** Change name anytime
- **Change Email:** Update email address
- **Change Password:** Secure password change (requires current password)
- **Profile Picture:** Upload JPG, PNG, GIF, WebP (5MB max)

#### Account Security

- **Password Change Flow:**
  - Enter current password (verified)
  - Enter new password (6+ characters)
  - Confirm new password (must match)
  - Hashed and stored securely

---

### 7. Analytics & Engagement Tracking

#### Display Metrics

- **Uptime:** Percentage of time display is online
- **Connection Status:** Current online/offline status
- **Last Seen:** Last communication timestamp
- **Resolution Info:** Screen size and orientation
- **Location:** Display location data

#### Advertisement Metrics

- **Impressions:** Number of times shown
- **Engagement:** Clicks and interactions
- **View Duration:** Total time ad was displayed
- **Completed Views:** Full playback count
- **Partial Views:** Incomplete playback count

#### Analytics Queries

- **Per-Display Analytics:** Metrics for specific display
- **Per-Advertisement Analytics:** Metrics for specific ad
- **Summary View:** Aggregate metrics across all resources
- **Time-Based:** Optional date range filtering

---

## Database Models & ER Diagram

### Entity Relationship Diagram

┌─────────────┐
│ User │
├─────────────┤
│ \_id (PK) │◄────┐
│ username │ │
│ email │ │ 1:N
│ password │ │
│ firstName │ │
│ lastName │ │
│ role │ │
│ googleId │ │
│ createdAt │ │
└─────────────┘ │
│ │
│ 1:N │
▼ │
┌──────────────────┐│
│ Advertisement ││
├──────────────────┤│
│ \_id (PK) ││
│ adId ││
│ advertiser (FK)──┘
│ adName │
│ mediaUrl │
│ mediaType │
│ duration │
│ status │
│ createdAt │
└──────────────────┘
▲
│ M:N
│ (in DisplayLoop.advertisements[])
│
┌──────────────────┐
│ DisplayLoop │
├──────────────────┤
│ id (PK) │
│ loopId │
│ displayId (FK) │
│ loopName │
│ advertisements[] │
│ rotationType │
│ createdAt │
└──────────────────┘
▲
│ 1:N
│
┌──────────────────┐ ┌──────────────────┐
│ Display │ │ SystemLog │
├──────────────────┤ ├──────────────────┤
│ id (PK) │ │ \_id (PK) │
│ displayId │ │ action │
│ displayName │ │ entityType │
│ assignedAdmin(FK)┼───►│ entityId │
│ status │ │ userId (FK) │
│ currentLoop(FK) │ │ details │
│ connectionToken │ │ createdAt │
│ createdAt │ └──────────────────┘
└──────────────────┘
┌────────────────────────┐
│ DisplayConnectionReq │
├────────────────────────┤
│ \_id (PK) │
│ displayId (FK) │
│ displayName │
│ status (pending/...) │
│ respondedBy (FK) │
│ createdAt │
└────────────────────────┘
┌────────────────────────┐
│ Analytics │
├────────────────────────┤
│ \_id (PK) │
│ displayId (FK) │
│ adId (FK) │
│ loopId (FK) │
│ impressions │
│ engagementMetrics │
│ viewDuration │
│ createdAt │
└────────────────────────┘

### Model Schemas

#### 1. User Model

````javascript
{
  _id: ObjectId (primary key)
  username: String (3-30 chars, unique, required)
  email: String (unique, required, valid email format)
  password: String (6+ chars, hashed with bcryptjs, select: false)
  firstName: String (optional, trimmed)
  lastName: String (optional, trimmed)
  role: String (enum: "admin" | "advertiser", default: "advertiser")
  googleId: String (unique sparse index for OAuth)
  isActive: Boolean (default: true)
  profilePicture: String (base64 URL or image URL)
  lastLogin: Date (updated on each login)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- username (unique)
- email (unique)
- googleId (unique, sparse)
2. Advertisement Model
{
  _id: ObjectId (primary key)
  adId: String (unique, format: "AD-{UUID}")
  advertiser: ObjectId (FK to User, required)
  adName: String (3+ chars, required, trimmed)
  mediaUrl: String (base64 data URL or external URL, required)
  mediaType: String (enum: "image" | "video", required)
  thumbnailUrl: String (auto-generated for images, default: null)
  duration: Number (1-300 seconds, required)
  description: String (max 500 chars, trimmed)
  status: String (enum: "active" | "scheduled" | "paused" | "expired" | "draft")
  targetAudience: String (default: "general")
  fileSize: Number (bytes)
  views: Number (impressions, default: 0)
  clicks: Number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- advertiser
- status
- createdAt
3. Display Model
{
  _id: ObjectId (primary key)
  displayId: String (3+ chars, unique, required)
  displayName: String (required, trimmed)
  location: String (required, trimmed)
  status: String (enum: "online" | "offline" | "inactive", default: "offline")
  assignedAdmin: ObjectId (FK to User)
  resolution: {
    width: Number (default: 1920)
    height: Number (default: 1080)
  }
  lastSeen: Date (heartbeat timestamp)
  firmwareVersion: String (default: "1.0.0")
  configuration: {
    brightness: Number (0-100, default: 100)
    volume: Number (0-100, default: 50)
    refreshRate: Number (default: 60, in Hz)
    orientation: String (enum: "portrait" | "landscape", default: "landscape")
  }
  connectionToken: String (unique, 36-char UUID)
  password: String (hashed, optional)
  isConnected: Boolean (current connection status, default: false)
  currentLoop: ObjectId (FK to DisplayLoop, nullable)
  needsRefresh: Boolean (flag for refresh trigger, default: false)
  lastRefreshCheck: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- displayId (unique)
- connectionToken (unique)
- assignedAdmin
- status
- createdAt
4. DisplayLoop Model
{
  _id: ObjectId (primary key)
  loopId: String (unique, auto-generated)
  loopName: String (3+ chars, required, trimmed)
  displayId: ObjectId (FK to Display, required)
  advertisements: [
    {
      adId: ObjectId (FK to Advertisement)
      loopOrder: Number (display sequence)
    }
  ]
  rotationType: String (enum: "sequential" | "random" | "weighted", default: "sequential")
  displayLayout: String (enum: "fullscreen" | "masonry", default: "fullscreen")
  totalDuration: Number (sum of all ad durations in seconds)
  isActive: Boolean (default: true)
  description: String (max 500 chars)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- displayId
- isActive
- createdAt
5. SystemLog Model
{
  _id: ObjectId (primary key)
  action: String (enum: "create" | "update" | "delete" | "status_change" | "approve" | "reject" | "other")
  entityType: String (enum: "display" | "advertisement" | "loop" | "user" | "system")
  entityId: ObjectId (what was affected)
  userId: ObjectId (FK to User, who performed action)
  details: {
    description: String (human-readable action description)
    changes: Mixed (before/after object)
    metadata: Mixed (additional context)
  }
  ipAddress: String (request origin)
  userAgent: String (browser/client info)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- userId
- createdAt
- entityType
- entityId
- action
- createdAt (compound: userId + createdAt)
6. Analytics Model
{
  _id: ObjectId (primary key)
  displayId: ObjectId (FK to Display, required)
  adId: ObjectId (FK to Advertisement, required)
  loopId: ObjectId (FK to DisplayLoop, required)
  impressions: Number (times shown, default: 0)
  engagementMetrics: {
    clicks: Number (default: 0)
    interactions: Number (user interactions, default: 0)
    dwellTime: Number (seconds, default: 0)
  }
  viewDuration: Number (seconds ad was visible)
  completedViews: Number (full playback, default: 0)
  partialViews: Number (incomplete playback, default: 0)
  timestamp: Date (event time, default: now)
  date: Date (required for grouping, indexed)
  metadata: {
    deviceType: String (display type)
    location: String (display location)
    weatherCondition: String (optional context)
    crowdDensity: String (optional context)
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- displayId
- adId
- loopId
- date
7. DisplayConnectionRequest Model
{
  _id: ObjectId (primary key)
  requestId: String (unique, auto-generated)
  displayId: ObjectId (FK to Display, required)
  displayName: String (device name)
  displayLocation: String (device location)
  firmwareVersion: String (default: "unknown")
  status: String (enum: "pending" | "approved" | "rejected", default: "pending")
  requestedAt: Date (when requested, default: now)
  respondedAt: Date (when admin responded)
  respondedBy: ObjectId (FK to User, admin who responded)
  rejectionReason: String (max 500 chars, if rejected)
  notes: String (admin notes, max 1000 chars)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
Indexes:
- status (for pending queries)
- createdAt
---
## API Endpoints
### Authentication Endpoints
#### Public Routes
**POST `/api/auth/register`**
- Register new user account
- **Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
````

- **Validation:**
  - Username: 3-30 chars, unique, alphanumeric + underscore
  - Email: valid format, unique
  - Password: minimum 6 characters
  - Password & confirmPassword must match
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "...",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "advertiser"
      },
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
  ```
- **Status Codes:** 201 (created), 400 (validation error), 409 (user exists)

---

POST /api/auth/login

- Login with username/email and password
- Body:
  {
  usernameOrEmail: john_doe or john@example.com,
  password: password123
  }
  - Validation:
  - Required fields check
  - Credential verification (bcryptjs comparison)
- Response: Same as register endpoint
- Status Codes: 200 (success), 400 (validation), 401 (invalid credentials)
- Rate Limit: 5 requests per 15 minutes

---

POST /api/auth/refresh-token

- Generate new access token using refresh token
- Body:
  {
  refreshToken: eyJhbGc...
  }
  - Response:
    {
    success: true,
    data: {
    accessToken: eyJhbGc...,
    user: { ... }
    }
    }
  - Status Codes: 200 (success), 401 (invalid token), 403 (token expired)

---

GET /api/auth/me

- Get current user profile
- Auth: Required (Bearer token)
- Response:
  {
  success: true,
  data: {
  \_id: ...,
  username: john_doe,
  email: john@example.com,
  firstName: John,
  lastName: Doe,
  role: advertiser,
  profilePicture: ...
  }
  }
  - Status Codes: 200 (success), 401 (unauthorized)

---

Google OAuth Routes
GET /api/auth/google

- Initiate Google OAuth flow
- Redirects to Google consent screen
- No body required

---

GET /api/auth/google/callback

- Handle Google OAuth callback
- Automatically creates/updates user
- Query: code (from Google)
- Redirect: Frontend dashboard if successful

---

Advertisement Endpoints
Public Routes
GET /api/ads/public

- Get all active advertisements (for display clients)
- Query Parameters:
  - page (default: 1, must be positive integer)
  - limit (default: 10, max: 100)
- Response:
  {
  success: true,
  data: {
  advertisements: [
  {
  _id: ...,
  adId: AD-xxx,
  adName: Summer Sale,
  mediaUrl: data:image/jpeg;base64,...,
  mediaType: image,
  duration: 5,
  status: active
  }
  ],
  pagination: {
  page: 1,
  limit: 10,
  total: 45,
  totalPages: 5
  }
  }
  }
  - Status Codes: 200 (success), 400 (invalid pagination)

---

Protected Routes (Authentication Required)
POST /api/ads

- Create new advertisement
- Auth: Required
- Body (Option 1 - File Upload):
  {
  adName: Summer Sale,
  mediaType: image,
  duration: 5,
  description: End of season sale
  }
  File: Form-data with media field (max 100MB)
- Body (Option 2 - URL):
  {
  adName: Summer Sale,
  mediaUrl: https://example.com/image.jpg,
  mediaType: image,
  duration: 5,
  description: End of season sale
  }
- Validation:
  - adName: 3+ characters
  - mediaType: "image" or "video"
  - duration: 1-300 seconds
  - File size: max 100MB
  - MIME type: Valid images or videos only
  - Either file OR mediaUrl (not both)
- Response:
  {
  success: true,
  data: {
  advertisement: {
  \_id: ...,
  adId: AD-xxx,
  advertiser: ...,
  adName: Summer Sale,
  mediaUrl: data:image/jpeg;base64,...,
  mediaType: image,
  duration: 5,
  status: active,
  createdAt: 2024-01-15T10:00:00Z
  }
  }
  }
  - Status Codes: 201 (created), 400 (validation), 401 (unauthorized), 413 (file too large)

---

GET /api/ads

- Get all advertisements for current user (paginated)
- Auth: Required
- Query Parameters:
  - page (default: 1)
  - limit (default: 10, max: 100)
  - status (filter: active, scheduled, paused, expired, draft)
  - search (search in adName and description)
  - sortBy (field: adName, createdAt, status, duration)
  - order (asc or desc, default: desc)
- Response:
  {
  success: true,
  data: {
  advertisements: [ ... ],
  pagination: { ... }
  }
  }
  - Status Codes: 200 (success), 401 (unauthorized)

---

GET /api/ads/:id

- Get single advertisement by ID
- Auth: Required
- URL Params: id (MongoDB ObjectId)
- Response: Single advertisement object
- Status Codes: 200 (success), 404 (not found), 403 (forbidden)

---

PUT /api/ads/:id

- Update advertisement
- Auth: Required
- Body:
  {
  adName: Updated Name,
  description: Updated description,
  duration: 10,
  status: paused,
  thumbnailUrl: ...
  }
  - Validation:
  - adName (if provided): 3+ characters
  - duration (if provided): 1-300 seconds
  - status (if provided): valid enum
  - Only advertiser who created ad can update
- Response: Updated advertisement object
- Status Codes: 200 (success), 400 (validation), 403 (forbidden), 404 (not found)

---

PUT /api/ads/:id/status

- Update only advertisement status
- Auth: Required
- Body:
  {
  status: active
  }
  - Valid Statuses: active, scheduled, paused, expired, draft
- Response: Updated advertisement
- Status Codes: 200, 400, 403, 404

---

DELETE /api/ads/:id

- Delete advertisement
- Auth: Required
- Cascade: Automatically removed from all loops
- Response:
  {
  success: true,
  message: Advertisement deleted successfully
  }
  - Status Codes: 200 (success), 403 (forbidden), 404 (not found)

---

Display Endpoints
Public Routes
POST /api/displays/register-self

- Browser-based display self-registration
- No Auth Required
- Body:
  {
  displayName: Store Entrance,
  location: Main Street,
  displayId: store-001,
  password: securePass123,
  resolution: {
  width: 1920,
  height: 1080
  },
  browserInfo: Chrome 120
  }
  - Validation:
  - displayName: 3+ chars, required
  - location: 3+ chars, required
  - displayId: 3+ chars, unique, required
  - password (if provided): 4+ chars
  - resolution: valid width/height (min 100)
- Response:
  {
  success: true,
  data: {
  display: {
  \_id: ...,
  displayId: store-001,
  displayName: Store Entrance,
  connectionToken: 36-char-uuid,
  status: offline
  }
  }
  }
  - Status Codes: 201 (created), 400 (validation), 409 (displayId exists)

---

POST /api/displays/login-display

- Login to registered display device
- No Auth Required
- Body:
  {
  displayId: store-001,
  password: securePass123
  }
  - Response: Same as register-self
- Status Codes: 200, 401 (invalid credentials), 404 (not found)

---

GET /api/displays/by-token/:token

- Get display by connection token
- No Auth Required
- URL Params: token (36-char UUID)
- Response: Display object with current loop
- Status Codes: 200, 404 (token not found)

---

GET /api/displays/loop/:token

- Get display's current loop with all advertisements
- No Auth Required
- URL Params: token (connection token)
- Response:
  {
  success: true,
  data: {
  loop: {
  \_id: ...,
  loopId: ...,
  loopName: ...,
  rotationType: sequential,
  displayLayout: fullscreen
  },
  advertisements: [
  {
  _id: ...,
  adId: AD-xxx,
  adName: ...,
  mediaUrl: ...,
  duration: 5
  }
  ]
  }
  }
  - Status Codes: 200, 404

---

POST /api/displays/report-status

- Display client heartbeat and status report
- No Auth Required
- Body:
  {
  connectionToken: 36-char-uuid,
  status: online,
  currentAdPlaying: AD-xxx,
  isPlaying: true
  }
  - Effect: Updates lastSeen timestamp, records status
- Response: Success message
- Status Codes: 200, 404

---

GET /api/displays/check-refresh/:displayId

- Check if display needs refresh
- No Auth Required
- URL Params: displayId
- Response:
  {
  success: true,
  data: {
  needsRefresh: true,
  newLoopId: ...
  }
  }
  - Status Codes: 200, 404

---

Protected Routes (Authentication Required)
POST /api/displays

- Create new display (admin-only)
- Auth: Required, Admin role
- Body:
  {
  displayName: Conference Room,
  location: Building A, Floor 2,
  resolution: {
  width: 1920,
  height: 1080
  },
  configuration: {
  brightness: 100,
  volume: 50,
  refreshRate: 60,
  orientation: landscape
  },
  password: optional-password
  }
  - Response: Display with connectionToken
- Status Codes: 201, 400, 401, 403

---

GET /api/displays

- Get all displays for authenticated admin
- Auth: Required, Admin role
- Query Parameters:
  - page (default: 1)
  - limit (default: 10)
  - status (filter: online, offline, inactive)
- Response: Paginated display list
- Status Codes: 200, 401, 403

---

GET /api/displays/:id

- Get single display details
- Auth: Required
- URL Params: id (ObjectId)
- Response: Display object with current loop
- Status Codes: 200, 404, 403

---

PUT /api/displays/:id

- Update display properties
- Auth: Required
- Body:
  {
  displayName: Updated Name,
  location: New Location,
  status: online,
  configuration: { ... }
  }
  - Response: Updated display object
- Status Codes: 200, 400, 403, 404

---

DELETE /api/displays/:id

- Delete display
- Auth: Required, owner or admin
- Cascade: Associated loops remain but are unassigned
- Response: Success message
- Status Codes: 200, 403, 404

---

PUT /api/displays/:id/assign-admin

- Assign admin to display (for approval flow)
- Auth: Required, Admin role
- Body: (empty)
- Response: Updated display
- Status Codes: 200, 403, 404

---

PUT /api/displays/:displayId/assign-loop

- Assign loop to display for playback
- Auth: Required
- Body:
  {
  loopId: ObjectId of loop
  }
  - Effect: Sets currentLoop, triggers refresh flag
- Response: Updated display
- Status Codes: 200, 400, 403, 404

---

POST /api/displays/:displayId/trigger-refresh

- Force immediate refresh on display
- Auth: Required
- Body: (empty)
- Effect: Sets needsRefresh = true
- Response: Success message
- Status Codes: 200, 403, 404

---

GET /api/displays/connection-requests/all

- Get all connection requests (admin only)
- Auth: Required, Admin role
- Query Parameters:
  - page (default: 1)
  - limit (default: 10)
  - status (pending, approved, rejected)
- Response: Paginated list of requests
- Status Codes: 200, 401, 403

---

POST /api/displays/connection-requests/:requestId/approve

- Approve display connection request
- Auth: Required, Admin role
- Body: (empty)
- Effect: Sets status to "approved", logs action
- Response: Success message
- Status Codes: 200, 403, 404

---

POST /api/displays/connection-requests/:requestId/reject

- Reject display connection request
- Auth: Required, Admin role
- Body:
  {
  rejectionReason: Duplicate device registration
  }
  - Effect: Sets status to "rejected", stores reason
- Response: Success message
- Status Codes: 200, 403, 404

---

Display Loop (Playlist) Endpoints
POST /api/loops

- Create new display loop
- Auth: Required
- Body:
  {
  displayId: ObjectId of display,
  loopName: Morning Schedule,
  description: Ads to run 6am-12pm,
  rotationType: sequential,
  displayLayout: fullscreen,
  advertisements: [
  {
  adId: ObjectId of ad,
  loopOrder: 1
  },
  {
  adId: ObjectId of another ad,
  loopOrder: 2
  }
  ]
  }
  - Validation:
  - displayId: must exist, user must own it
  - loopName: 3+ chars, required
  - advertisements: non-empty array, all ads must exist
  - rotationType: sequential, random, or weighted
  - displayLayout: fullscreen or masonry
- Response: Created loop with totalDuration calculated
- Status Codes: 201, 400, 403, 404

---

GET /api/loops

- Get all loops for authenticated user
- Auth: Required
- Query Parameters:
  - page (default: 1)
  - limit (default: 10)
- Response: Paginated loop list
- Status Codes: 200, 401

---

GET /api/loops/:id

- Get single loop with all advertisement details
- Auth: Required
- URL Params: id (ObjectId)
- Response: Loop object with populated ads
- Status Codes: 200, 404, 403

---

GET /api/displays/:displayId/loops

- Get all loops for specific display
- Auth: Required
- URL Params: displayId (ObjectId)
- Response: Array of loops for that display
- Status Codes: 200, 404, 403

---

PUT /api/loops/:id

- Update loop properties
- Auth: Required
- Body:
  {
  loopName: Updated Name,
  description: Updated description,
  rotationType: random,
  displayLayout: masonry
  }
  - Response: Updated loop
- Status Codes: 200, 400, 403, 404

---

PUT /api/loops/:id/reorder

- Reorder advertisements within loop
- Auth: Required
- Body:
  {
  advertisements: [
  { adId: ObjectId, loopOrder: 1 },
  { adId: ObjectId, loopOrder: 2 },
  { adId: ObjectId, loopOrder: 3 }
  ]
  }
  - Effect: Updates loopOrder, recalculates totalDuration
- Response: Updated loop
- Status Codes: 200, 400, 403, 404

---

DELETE /api/loops/:id

- Delete display loop
- Auth: Required
- Effect: Unassigns from displays, doesn't affect ads
- Response: Success message
- Status Codes: 200, 403, 404

---

Activity Logs Endpoints
GET /api/logs

- Get filtered activity logs with advanced search
- Auth: Required
- Query Parameters:
  - page (default: 1, pagination)
  - limit (default: 10)
  - action (filter: create, update, delete, status_change, etc.)
  - entityType (filter: display, advertisement, loop, user, system)
  - userId (filter by specific user)
  - entityId (filter by affected resource)
  - search (search in description/changes)
  - startDate (ISO format: YYYY-MM-DDTHH:mm:ssZ)
  - endDate (ISO format)
- Response:
  {
  success: true,
  data: {
  logs: [
  {
  _id: ...,
  action: create,
  entityType: advertisement,
  entityId: ...,
  userId: { _id: ..., username: admin },
  details: {
  description: Advertisement created,
  changes: { ... },
  metadata: { ... }
  },
  ipAddress: 192.168.1.1,
  userAgent: Mozilla/5.0...,
  createdAt: 2024-01-15T10:00:00Z
  }
  ],
  pagination: { ... }
  }
  }
  - Status Codes: 200, 401

---

GET /api/logs/entity/:entityType/:entityId

- Get all logs for specific entity
- Auth: Required
- URL Params:
  - entityType (display, advertisement, loop, user, system)
  - entityId (ObjectId of resource)
- Query: page, limit for pagination
- Response: Paginated logs for that entity
- Status Codes: 200, 404, 401

---

GET /api/logs/user/:userId

- Get all activity logs for specific user
- Auth: Required
- URL Params: userId (ObjectId)
- Query: page, limit
- Response: Paginated logs by user
- Status Codes: 200, 404, 401

---

DELETE /api/logs/:id

- Delete single log entry
- Auth: Required, Admin only
- Response: Success message
- Status Codes: 200, 403, 404

---

User Profile Endpoints
GET /api/profile

- Get current user's profile
- Auth: Required
- Response:
  {
  success: true,
  data: {
  user: {
  \_id: ...,
  username: john_doe,
  email: john@example.com,
  firstName: John,
  lastName: Doe,
  role: advertiser,
  profilePicture: ...,
  lastLogin: 2024-01-15T10:00:00Z
  }
  }
  }
  - Status Codes: 200, 401

---

PUT /api/profile

- Update user name
- Auth: Required
- Body:
  {
  firstName: John,
  lastName: Smith
  }
  - Response: Updated user object
- Status Codes: 200, 400, 401

---

PUT /api/profile/email

- Change user email
- Auth: Required
- Body:
  {
  email: newemail@example.com
  }
  - Validation: Valid email format, unique in database
- Response: Updated user
- Status Codes: 200, 400, 401, 409 (email exists)

---

PUT /api/profile/password

- Change user password
- Auth: Required
- Body:
  {
  currentPassword: oldpass123,
  newPassword: newpass456,
  confirmPassword: newpass456
  }
  - Validation:
  - currentPassword verified against stored hash
  - newPassword: 6+ chars
  - newPassword and confirmPassword must match
- Response: Success message
- Status Codes: 200, 400, 401 (wrong current password)

---

POST /api/profile/picture

- Upload profile picture
- Auth: Required
- File: Form-data with profilePicture field
  - Max size: 5MB
  - Allowed types: JPEG, PNG, GIF, WebP
- Response: Updated user object with new picture URL
- Status Codes: 200, 400, 401, 413 (file too large)

---

Analytics Endpoints
GET /api/analytics/displays/:displayId

- Get metrics for specific display
- Auth: Required
- URL Params: displayId (ObjectId)
- Response:
  {
  success: true,
  data: {
  displayMetrics: {
  displayId: ...,
  displayName: ...,
  uptime: 95.5,
  status: online,
  lastSeen: 2024-01-15T10:00:00Z,
  location: ...,
  totalImpressions: 1024,
  totalEngagements: 156
  }
  }
  }
  - Status Codes: 200, 404, 403

---

GET /api/analytics/displays-summary

- Get summary analytics for all user's displays
- Auth: Required
- Response:
  {
  success: true,
  data: {
  summary: {
  totalDisplays: 5,
  onlineDisplays: 4,
  totalImpressions: 50000,
  averageUptime: 98.2,
  topPerformingDisplay: { ... }
  }
  }
  }
  - Status Codes: 200, 401

---

GET /api/analytics/ads/:adId

- Get metrics for specific advertisement
- Auth: Required
- URL Params: adId (ObjectId)
- Response:
  {
  success: true,
  data: {
  adMetrics: {
  adId: ...,
  adName: ...,
  totalImpressions: 2500,
  clicks: 345,
  clickThroughRate: 13.8,
  completedViews: 2480,
  partialViews: 20,
  averageDwellTime: 12.5
  }
  }
  }
  - Status Codes: 200, 404, 403

---

GET /api/analytics/ads-summary

- Get summary analytics for all user's advertisements
- Auth: Required
- Response:
  {
  success: true,
  data: {
  summary: {
  totalAds: 12,
  totalImpressions: 50000,
  totalClicks: 4200,
  averageClickThroughRate: 8.4,
  topPerformingAd: { ... }
  }
  }
  }
  - Status Codes: 200, 401

---

Health Check
GET /api/health

- Server health check
- No Auth Required
- Response:
  {
  status: ok,
  timestamp: 2024-01-15T10:00:00Z,
  uptime: 3600
  }
  - Status Codes: 200

---

Authentication & Authorization
JWT Token System
Token Structure
Access Token (7-day expiry):
{
userId: "ObjectId",
iat: timestamp,
exp: timestamp + 7 days
}
Refresh Token (30-day expiry):
{
userId: "ObjectId",
type: "refresh",
iat: timestamp,
exp: timestamp + 30 days
}
Token Usage
Storing Tokens:

- Access Token: localStorage or sessionStorage
- Refresh Token: httpOnly cookie (preferred) or localStorage
  Sending Tokens:
  Authorization: Bearer {accessToken}
  Token Refresh Flow:

1. Check if access token expired
2. If expired, send refresh token to /api/auth/refresh-token
3. Receive new access token
4. Update stored token
5. Continue request with new token
   Token Errors
   Error HTTP Code Action
   TokenExpiredError 401 Call refresh-token endpoint
   JsonWebTokenError 401 Redirect to login
   No token provided 401 Redirect to login
   Invalid signature 401 Redirect to login

---

Role-Based Access Control (RBAC)
Admin Role

- Permissions:
  - Create, read, update, delete displays
  - Approve/reject display connection requests
  - View all activity logs
  - Manage system settings
  - Access admin dashboard
- Restricted Endpoints:
  - All /api/displays/connection-requests/\*
  - /api/logs/:id (DELETE)
  - Display management endpoints
    Advertiser Role
- Permissions:
  - Create, read, update, delete own advertisements
  - Create, read, update, delete own displays
  - Create, read, update, delete own display loops
  - View own activity logs
  - View own analytics
- Restrictions:
  - Cannot approve/reject connections
  - Cannot view other users' logs
  - Cannot delete logs
  - Cannot access admin functions
    Authorization Flow

1. User submits request with Authorization header
2. Middleware extracts and verifies JWT token
3. Token decoded, userId retrieved
4. Check if action requires specific role
5. If role mismatch: Return 403 Forbidden
6. Check resource ownership (e.g., ad owner match)
7. If ownership fails: Return 403 Forbidden
8. If all checks pass: Proceed to controller

---

OAuth 2.0 (Google)
Setup Requirements

1. Google Cloud Project created
2. OAuth 2.0 credentials generated (Client ID + Secret)
3. Redirect URI configured: https://your-app.com/auth-callback
   OAuth Flow
   User clicks "Login with Google"
   ↓
   Frontend redirects to /api/auth/google
   ↓
   Passport.js redirects to Google consent screen
   ↓
   User grants permission
   ↓
   Google redirects to callback with authorization code
   ↓
   Backend exchanges code for tokens with Google
   ↓
   Extract user info (email, name, profile picture)
   ↓
   Check if user exists in database
   ↓
   If new: Create user account with Google profile data
   If exists: Update lastLogin
   ↓
   Generate JWT access & refresh tokens
   ↓
   Redirect to frontend dashboard
   ↓
   Frontend stores tokens in localStorage
   User Data Mapping
   Google Profile User Model
   sub (ID) googleId
   email email
   given_name firstName
   family_name lastName
   picture (URL) profilePicture

---

Validation Rules
Input Validation
User Registration Validation
{
username: {
required: true,
type: "string",
minLength: 3,
maxLength: 30,
pattern: /^[a-zA-Z0-9_]+$/, // alphanumeric + underscore
    unique: true,
    message: "Username must be 3-30 chars, alphanumeric + underscore, unique"
  },
  email: {
    required: true,
    type: "string",
    format: "email",
    unique: true,
    message: "Valid unique email required"
  },
  password: {
    required: true,
    type: "string",
    minLength: 6,
    message: "Password must be at least 6 characters"
  },
  confirmPassword: {
    required: true,
    type: "string",
    equals: "password",
    message: "Passwords must match"
  },
  firstName: {
    type: "string",
    optional: true,
    trim: true
  },
  lastName: {
    type: "string",
    optional: true,
    trim: true
  }
}
Advertisement Creation Validation
{
  adName: {
    required: true,
    type: "string",
    minLength: 3,
    trim: true,
    message: "Ad name must be at least 3 characters"
  },
  mediaType: {
    required: true,
    type: "string",
    enum: ["image", "video"],
    message: "Media type must be 'image' or 'video'"
  },
  duration: {
    required: true,
    type: "integer",
    min: 1,
    max: 300,
    message: "Duration must be 1-300 seconds"
  },
  media (file): {
    optional: true,
    maxSize: 104857600, // 100MB in bytes
    mimeTypes: [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/quicktime", "video/x-msvideo"
    ],
    message: "File must be valid image/video under 100MB"
  },
  mediaUrl: {
    optional: true,
    type: "string",
    format: "url",
    protocol: ["http", "https"],
    message: "Must be valid HTTP/HTTPS URL"
  },
  description: {
    optional: true,
    type: "string",
    maxLength: 500,
    trim: true
  }
}
// Conditional: Either file OR mediaUrl required (not both)
mediaConstraint: {
  condition: "file XOR mediaUrl",
  message: "Provide either file upload or URL, not both"
}
Display Creation Validation
{
  displayId: {
    required: true,
    type: "string",
    minLength: 3,
    unique: true,
    trim: true,
    message: "Display ID must be 3+ unique alphanumeric characters"
  },
  displayName: {
    required: true,
    type: "string",
    minLength: 3,
    trim: true,
    message: "Display name must be at least 3 characters"
  },
  location: {
    required: true,
    type: "string",
    minLength: 3,
    trim: true,
    message: "Location must be at least 3 characters"
  },
  password: {
    optional: true,
    type: "string",
    minLength: 4,
    message: "Password must be at least 4 characters if provided"
  },
  resolution: {
    optional: true,
    type: "object",
    properties: {
      width: {
        type: "integer",
        min: 100,
        max: 10000,
        message: "Width must be 100-10000"
      },
      height: {
        type: "integer",
        min: 100,
        max: 10000,
        message: "Height must be 100-10000"
      }
    }
  },
  configuration: {
    optional: true,
    type: "object",
    properties: {
      brightness: { type: "integer", min: 0, max: 100 },
      volume: { type: "integer", min: 0, max: 100 },
      refreshRate: { type: "integer", min: 30, max: 120 },
      orientation: { enum: ["portrait", "landscape"] }
    }
  }
}
Display Loop Creation Validation
{
  displayId: {
    required: true,
    type: "ObjectId",
    exists: true,
    ownedByUser: true,
    message: "Display must exist and belong to current user"
  },
  loopName: {
    required: true,
    type: "string",
    minLength: 3,
    trim: true,
    message: "Loop name must be at least 3 characters"
  },
  advertisements: {
    required: true,
    type: "array",
    minLength: 1,
    maxLength: 999,
    message: "Must include at least 1 advertisement"
  },
  "advertisements[].adId": {
    required: true,
    type: "ObjectId",
    exists: true,
    message: "Advertisement must exist in database"
  },
  "advertisements[].loopOrder": {
    required: true,
    type: "integer",
    min: 1,
    message: "Loop order must be positive integer"
  },
  rotationType: {
    optional: true,
    type: "string",
    enum: ["sequential", "random", "weighted"],
    default: "sequential"
  },
  displayLayout: {
    optional: true,
    type: "string",
    enum: ["fullscreen", "masonry"],
    default: "fullscreen"
  }
}
Pagination Validation
{
  page: {
    optional: true,
    type: "integer",
    min: 1,
    default: 1,
    coerce: true, // parseInt
    message: "Page must be positive integer"
  },
  limit: {
    optional: true,
    type: "integer",
    min: 1,
    max: 100,
    default: 10,
    coerce: true,
    message: "Limit must be 1-100"
  }
}
Query Filter Validation
{
  status: {
    optional: true,
    type: "string",
    enum: ["active", "scheduled", "paused", "expired", "draft"],
    message: "Invalid status value"
  },
  sortBy: {
    optional: true,
    type: "string",
    enum: ["adName", "createdAt", "status", "duration"],
    default: "createdAt",
    message: "Invalid sort field"
  },
  order: {
    optional: true,
    type: "string",
    enum: ["asc", "desc"],
    default: "desc",
    message: "Order must be 'asc' or 'desc'"
  },
  search: {
    optional: true,
    type: "string",
    maxLength: 100,
    trim: true,
    // Converted to regex for searching
    message: "Search query too long (max 100 chars)"
  }
}
Email Validation Validation
{
  email: {
    required: true,
    type: "string",
    format: "email",
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
unique: true,
message: "Valid unique email required"
}
}
Password Change Validation
{
currentPassword: {
required: true,
type: "string",
verify: (value, hashedStoredPassword) => {
return bcryptjs.compareSync(value, hashedStoredPassword)
},
message: "Current password is incorrect"
},
newPassword: {
required: true,
type: "string",
minLength: 6,
notEqual: "currentPassword",
message: "New password must be different and 6+ characters"
},
confirmPassword: {
required: true,
type: "string",
equals: "newPassword",
message: "Passwords must match"
}
}

---

Middleware & Services
Middleware Stack (Order of Execution)

1. helmet()
   Purpose: HTTP Security Headers
   // Added headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'
  Applied to: All routes

---

2. morgan('dev')
   Purpose: HTTP Request Logging
   // Logs format: METHOD URL STATUS RESPONSE_TIME ms
   // Example: GET /api/users 200 12.345 ms
   Configuration:

- Format: "dev" (colored, concise)
- Logs to console
- Applied to: All routes

---

3. cors()
   Purpose: Cross-Origin Request Handling
   {
   origin: process.env.FRONTEND_URL,
   credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
   optionsSuccessStatus: 200
   }
   Error Response: 403 if origin not allowed
   Applied to: All routes

---

4. express.json()
   Purpose: Parse JSON request bodies
   {
   limit: "10mb"
   }
   Applied to: All routes

---

5. express.urlencoded()
   Purpose: Parse form-encoded request bodies
   {
   extended: true,
   limit: "10mb"
   }
   Applied to: All routes

---

6. rateLimiter (General API)
   Purpose: Prevent abuse
   {
   windowMs: 15 _ 60 _ 1000, // 15 minutes
   max: 500, // 500 requests per window
   standardHeaders: true,
   legacyHeaders: false,
   skip: (req) => req.path === '/api/health' // Skip health check
   }
   Response on Limit:
   {
   "success": false,
   "message": "Too many requests from this IP, please try again later."
   }
   Applied to: /api/\*

---

7. authLimiter (Auth Endpoints)
   Purpose: Stricter rate limiting on auth
   {
   windowMs: 15 _ 60 _ 1000,
   max: 5, // 5 requests per window
   skipSuccessfulRequests: true // Don't count successful logins
   }
   Applied to: /api/auth/login, /api/auth/register

---

8. multer (File Upload)
   Purpose: Handle file uploads in memory
   // Media Upload
   {
   storage: memoryStorage(), // No disk
   limits: { fileSize: 100 _ 1024 _ 1024 }, // 100MB
   fileFilter: (req, file, cb) => {
   const allowedMimes = [
   "image/jpeg", "image/png", "image/gif", "image/webp",
   "video/mp4", "video/quicktime", "video/x-msvideo"
   ]
   if (allowedMimes.includes(file.mimetype)) {
   cb(null, true)
   } else {
   cb(new Error("Invalid file type"))
   }
   }
   }
   // Profile Picture Upload
   {
   storage: memoryStorage(),
   limits: { fileSize: 5 _ 1024 _ 1024 }, // 5MB
   fileFilter: (req, file, cb) => {
   const imageMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
   if (imageMimes.includes(file.mimetype)) {
   cb(null, true)
   } else {
   cb(new Error("Only images allowed"))
   }
   }
   }
   Applied to: Ad creation, profile picture upload

---

9. verifyToken (Auth Middleware)
   Purpose: Validate JWT token
   Function signature: verifyToken(req, res, next)
   Steps:
1. Read Authorization header
1. Check format: "Bearer {token}"
1. Extract token
1. Verify with JWT_SECRET
1. Decode payload
1. Set req.user = { userId, ... }
1. Call next()
   Errors:

- No header → 401 "No token provided"
- Invalid format → 401 "Invalid token format"
- Expired token → 401 "Token has expired"
- Invalid signature → 401 "Invalid token"
  Usage: router.get('/protected', verifyToken, handler)

---

10. checkRole (Role Middleware)
    Purpose: Verify user role
    Function: checkRole(...allowedRoles)
    Returns middleware function
    Steps:
1. Check if req.user.role in allowedRoles
1. If yes: Call next()
1. If no: Return 403 "Insufficient permissions"
   Convenience wrapper:
   adminOnly = checkRole(ROLES.ADMIN)
   Usage: router.post('/admin-only', verifyToken, adminOnly, handler)

---

11. errorHandler (Global Error Handler)
    Purpose: Centralized error handling
    Function: errorHandler(err, req, res, next)
    // Must be last middleware (4 params)
    Handles:

- ValidationError (Mongoose)
- CastError (Invalid ObjectId)
- MongoError 11000 (Duplicate key)
- JsonWebTokenError (Token invalid)
- TokenExpiredError (Token expired)
- Custom errors
- Generic errors
  Response Format:
  {
  success: false,
  message: "Error description",
  statusCode: 400,
  errors: [...] // if validation errors
  }

---

Services
AuthService
Location: src/services/authService.js
Methods:
generateToken(userId, expiresIn)
Purpose: Create JWT access token
Returns: JWT token string
Example: generateToken(userId, '7d')
generateRefreshToken(userId)
Purpose: Create refresh token
Returns: JWT token string
Example: generateRefreshToken(userId)
verifyToken(token)
Purpose: Verify and decode JWT
Returns: Decoded payload { userId, iat, exp }
Throws: TokenExpiredError, JsonWebTokenError
verifyRefreshToken(token)
Purpose: Verify refresh token
Returns: Decoded payload
Throws: TokenExpiredError, JsonWebTokenError
register(username, email, password, firstName, lastName)
Purpose: Create new user account
Params: User credentials
Returns: { user, accessToken, refreshToken }
Throws: UserAlreadyExists, ValidationError
login(usernameOrEmail, password)
Purpose: Authenticate user
Params: Identifier and password
Returns: { user, accessToken, refreshToken }
Throws: InvalidCredentials, AccountInactive
refreshAccessToken(refreshToken)
Purpose: Generate new access token
Params: Valid refresh token
Returns: { accessToken, user }
Throws: InvalidToken, TokenExpired
getUserById(userId)
Purpose: Fetch user from database
Returns: User object (without password)
Throws: UserNotFound
Usage Example:
const authService = require('../services/authService');
// Login flow
const { user, accessToken, refreshToken } = await authService.login(
'john_doe',
'password123'
);
// Token refresh
const { accessToken: newToken } = await authService.refreshAccessToken(
refreshToken
);

---

LoggingService
Location: src/services/loggingService.js
Methods:
createLog(logData)
Purpose: Create audit log entry
Params: {
action: "create|update|delete|status_change|...",
entityType: "display|advertisement|loop|user|system",
entityId: ObjectId,
userId: ObjectId (required),
details: {
description: String,
changes: Mixed,
metadata: Mixed
},
ipAddress: String,
userAgent: String
}
Returns: Saved log document
Throws: ValidationError
getLogs(filters, page, limit)
Purpose: Query logs with filters
Params:
filters: {
action?: String,
entityType?: String,
userId?: ObjectId,
entityId?: ObjectId,
search?: String (regex search),
startDate?: Date,
endDate?: Date
}
page: Number (1-based)
limit: Number
Returns: { logs: [], pagination: {...} }
Throws: ValidationError
getEntityLogs(entityType, entityId, page, limit)
Purpose: Get logs for specific resource
Returns: { logs: [], pagination: {...} }
getUserLogs(userId, page, limit)
Purpose: Get logs by user
Returns: { logs: [], pagination: {...} }
deleteLog(logId)
Purpose: Remove log entry (admin only)
Returns: Deletion result
Throws: NotFound
Usage Example:
const loggingService = require('../services/loggingService');
// Log an action
await loggingService.createLog({
action: 'create',
entityType: 'advertisement',
entityId: adId,
userId: req.user.userId,
details: {
description: 'Advertisement created',
changes: { adName, mediaType, duration },
metadata: {}
},
ipAddress: req.ip,
userAgent: req.get('user-agent')
});
// Query logs
const { logs, pagination } = await loggingService.getLogs(
{
entityType: 'advertisement',
userId: req.user.userId,
startDate: new Date('2024-01-01'),
endDate: new Date('2024-01-31')
},
1, // page
10 // limit
);

---

#### Controllers

**Location:** `src/controllers/`
Each controller handles business logic for specific domain:

1. **authController.js** - Authentication logic
2. **advertisementsController.js** - Ad CRUD
3. **displaysController.js** - Display CRUD
4. **displayLoopsController.js** - Loop CRUD
5. **profileController.js** - User profile operations
6. **logsController.js** - Log queries
7. **analyticsController.js** - Analytics calculations

---

Configuration & Environment
Backend Environment Variables
Create .env file in AdMiroBackend/:

# Database

DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/admiro

# or local: DATABASE_URL=mongodb://localhost:27017/admiro

# Server

PORT=8000
NODE_ENV=development

# JWT

JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS and OAuth callback)

FRONTEND_URL=http://localhost:3000

# AWS S3 (Optional)

AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
Frontend Environment Variables
Create .env.local file in AdMiroFrontend/:

# API

NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth

NEXT*PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
Note: NEXT_PUBLIC* prefix makes variables accessible in browser JavaScript
Configuration Files
Backend:

- src/config/constants.js - App enums, roles, statuses
- src/config/database.js - MongoDB connection setup
- src/config/passport.js - Passport.js OAuth strategies
- src/config/s3.js - AWS S3 client (optional)
  Frontend:
- jsconfig.json - Path aliases
- next.config.mjs - Next.js config
- tailwind.config.js - Tailwind CSS theming
- postcss.config.mjs - PostCSS/Tailwind setup

---

Frontend Components
Pages
Public Pages

1. Home (/) - Landing page with hero, features, CTA
2. Login/Register (/login) - Auth form with OAuth option
   Protected Pages
3. Dashboard (/dashboard) - Main dashboard with metrics
4. Advertisements (/dashboard/ads) - Ad list and management
5. Create/Edit Ad (/dashboard/ads/new, /dashboard/ads/[id]/edit) - Ad form
6. Displays (/dashboard/displays) - Display list
7. Create/Edit Display (/dashboard/displays/new, /dashboard/displays/[id]/edit) - Display form
8. Display Loops (/dashboard/displays/[id]/loops) - Loop management per display
9. Global Loops (/dashboard/loops) - All loops view
10. Activity Logs (/dashboard/logs) - Audit log viewer
11. Analytics (/dashboard/analytics) - Metrics dashboard
12. Profile (/dashboard/profile) - User settings
13. Connection Requests (/dashboard/connection-requests) - Approve/reject flows
    Display Client Pages
14. Display Login (/display-login) - Display device login
15. Display Register (/display-register) - Device registration
16. Display Playback (/display) - Full-screen ad player
17. OAuth Callback (/auth-callback) - Google redirect handler
    Reusable Components

- DashboardLayout - Main dashboard wrapper with sidebar
- DisplayForm - Form for creating/editing displays
- ThemeProvider - Dark/light mode toggle
- ToastProvider - Toast notification system
- PageTransition - GSAP-based page animations
- ScrollToTop - Auto-scroll on navigation
  State Management (Zustand)
  // authStore.js
  {
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  setUser: (user) => void,
  setToken: (token) => void,
  logout: () => void
  }

---

Deployment Architecture
┌─────────────────────────────┐
│ Vercel (Frontend Hosting) │
│ ├─ Next.js 16 App │
│ ├─ Auto deployments │
│ └─ CDN & edge functions │
└──────────┬──────────────────┘
│ HTTPS
│ (API calls)
┌──────────▼──────────────────┐
│ Render/Railway Backend │
│ ├─ Express.js server │
│ ├─ Node.js runtime │
│ └─ Auto restart on crash │
└──────────┬──────────────────┘
│ Encrypted
│
┌──────────▼──────────────────┐
│ MongoDB Atlas (Database) │
│ ├─ Cloud hosted │
│ ├─ Automatic backups │
│ ├─ Replication & sharding │
│ └─ 7 collections │
└─────────────────────────────┘
Optional:
┌─────────────────────────┐
│ AWS S3 (File Storage) │
│ ├─ Media uploads │
│ └─ Profile pictures │
└─────────────────────────┘

---

## Setup Instructions

### Backend Setup

1. **Clone and Navigate:**
   ```bash
   cd AdMiroBackend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
4. **Start Server:**
   ```bash
   npm start
   # or development: npm run dev
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Clone and Navigate:**
   ```bash
   cd AdMiroFrontend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```
4. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:3000`

---

Summary
AdMiro is a comprehensive digital display management platform with:

- 50+ REST API endpoints for complete CRUD operations
- 7 MongoDB collections with proper indexing and relationships
- JWT + Google OAuth 2.0 authentication
- Role-based access control (Admin & Advertiser)
- Comprehensive activity logging for compliance
- Real-time display synchronization with 30-second polling
- Advanced analytics for displays and advertisements
- Professional UI with Tailwind CSS and GSAP animations
- Security features including rate limiting, input validation, and secure headers
- Scalable architecture with separation of concerns and microservice-ready design