# System Design Diagrams Guide - AdMiroTS
**Comprehensive Visual Architecture & Workflow Documentation**  
**Project**: AdMiroTS - Digital Signage & Advertisement Management  
**Date**: April 9, 2026  
**Status**: Complete specification for all 12 diagram types

---

## Table of Contents
1. [How to Use This Guide](#how-to-use-this-guide)
2. [Recommended Tools](#recommended-tools)
3. [Diagram 1: Entity-Relationship Diagram (ERD)](#diagram-1-entity-relationship-diagram-erd)
4. [Diagram 2: Use Case Diagram](#diagram-2-use-case-diagram)
5. [Diagram 3: Sequence Diagram - User Registration & Login](#diagram-3-sequence-diagram---user-registration-login)
6. [Diagram 4: Sequence Diagram - Advertisement Creation & Display](#diagram-4-sequence-diagram---advertisement-creation-display)
7. [Diagram 5: Component Architecture Diagram](#diagram-5-component-architecture-diagram)
8. [Diagram 6: Class Diagram - Core Entities](#diagram-6-class-diagram---core-entities)
9. [Diagram 7: Advertisement Lifecycle State Diagram](#diagram-7-advertisement-lifecycle-state-diagram)
10. [Diagram 8: Display Lifecycle State Diagram](#diagram-8-display-lifecycle-state-diagram)
11. [Diagram 9: API Gateway & Middleware Flow](#diagram-9-api-gateway--middleware-flow)
12. [Diagram 10: Data Flow Diagram (DFD)](#diagram-10-data-flow-diagram-dfd)
13. [Diagram 11: Deployment Architecture](#diagram-11-deployment-architecture)
14. [Diagram 12: Security Layers Diagram](#diagram-12-security-layers-diagram)

---

## How to Use This Guide

Each diagram includes:
1. **Purpose**: What the diagram shows and why it matters
2. **Key Elements**: Main entities, actors, or components
3. **Relationships**: How elements interact
4. **ASCII Representation**: Quick reference visualization
5. **Detailed Description**: Step-by-step visual guide
6. **Tools**: Recommended tools for creation
7. **Export Notes**: Best practices for sharing

### Tools for Creating Diagrams

#### Recommended (Free/Low-Cost)
1. **Lucidchart** (https://lucidchart.com) - $5.95/month
   - Best for: Professional-grade diagrams
   - Supports: All diagram types
   - Collaboration: Yes
   
2. **Draw.io** (https://draw.io) - FREE
   - Best for: Quick, collaborative diagrams
   - Supports: All diagram types
   - Collaboration: Yes (with Google Drive)
   - Desktop & web versions available
   
3. **Mermaid** (https://mermaid.js.org) - FREE
   - Best for: Text-based diagrams in code
   - Supports: Flowcharts, sequence, class, ER
   - Collaboration: Version control friendly
   
4. **PlantUML** (https://plantuml.com) - FREE
   - Best for: Diagram-as-code
   - Supports: All diagram types
   - Collaboration: Works with GitHub

#### Premium (Feature-Rich)
5. **OmniGraffle** - $100 one-time
6. **Visio** - $70/year
7. **Enterprise Architect** - $100+ one-time

---

## Diagram 1: Entity-Relationship Diagram (ERD)

### Purpose
Shows all database entities (collections in MongoDB) and their relationships. This is the foundation for understanding data structure and how entities interact.

### Key Elements
- **Entities**: User, Advertisement, Display, DisplayLoop, AnalyticsEvent, SystemLog
- **Attributes**: Fields within each entity
- **Relationships**: One-to-Many (1:M), Many-to-Many (M:M), One-to-One (1:1)
- **Primary Keys**: ID fields that uniquely identify records
- **Foreign Keys**: References between collections

### ASCII Visualization

```
┌─────────────────────────┐
│        User             │
├─────────────────────────┤
│ PK: id                  │
│    email (UNIQUE)       │
│    passwordHash         │
│    firstName            │
│    lastName             │
│    role (enum)          │
│    status (enum)        │
│    createdAt            │
│    updatedAt            │
└────┬────────────────────┘
     │
     │ 1:M (creates/owns)
     │
     ├─────────────────────────────────────────┐
     │                                         │
     ▼                                         ▼
┌─────────────────────────┐         ┌──────────────────────┐
│  Advertisement          │         │  Display             │
├─────────────────────────┤         ├──────────────────────┤
│ PK: id                  │         │ PK: id               │
│    adName               │         │    displayId         │
│    mediaUrl             │         │    location          │
│    mediaType (enum)     │         │    layout (enum)     │
│    duration             │         │    resolution        │
│    status (enum)        │         │    configuration     │
│    views               │         │    serialNumber      │
│    clicks              │         │    status (enum)     │
│ FK: advertiserId        │         │    lastPing          │
│    createdAt            │         │    createdAt         │
└────┬────────────────────┘         └──────┬───────────────┘
     │                                     │
     │ M:M                                 │ 1:M
     │ (contained in)                      │ (generates)
     │                                     │
     └────────┬────────────────────────────┘
              │
              ▼
      ┌──────────────────────┐
      │  DisplayLoop         │
      ├──────────────────────┤
      │ PK: id               │
      │    name              │
      │    advertisements[]  │
      │    displayIds[]      │
      │    status (enum)     │
      │    createdAt         │
      └──────────────────────┘
              │ 1:M
              │ (triggers)
              ▼
      ┌──────────────────────┐
      │  AnalyticsEvent      │
      ├──────────────────────┤
      │ PK: id               │
      │    type (VIEW/CLK)   │
      │ FK: advertisementId   │
      │ FK: displayId        │
      │    timestamp         │
      └──────────────────────┘
              │
              │ (logged by)
              ▼
      ┌──────────────────────┐
      │  SystemLog           │
      ├──────────────────────┤
      │ PK: id               │
      │    type              │
      │    action            │
      │ FK: userId           │
      │    timestamp         │
      └──────────────────────┘
```

### Detailed Description

1. **Central Entity - User**
   - Represents all users (advertisers, operators, admins)
   - Has unique email constraint
   - Contains encrypted password hash
   - Role determines permissions (ADMIN, ADVERTISER, OPERATOR)
   - Status tracks account state (ACTIVE, INACTIVE, LOCKED)

2. **Advertisement Entity**
   - Belongs to one User (the advertiser)
   - Referenced by DisplayLoop (M:M relationship)
   - Generates AnalyticsEvents when viewed/clicked
   - Status lifecycle: DRAFT → ACTIVE → PAUSED → EXPIRED

3. **Display Entity**
   - Physical or virtual display device
   - Plays content from DisplayLoops
   - Generates AnalyticsEvents
   - Serial number must be unique
   - Status: ONLINE/OFFLINE/INACTIVE

4. **DisplayLoop Entity**
   - Contains multiple advertisements (array)
   - Assigned to multiple displays (array)
   - Orchestrates what plays on which displays
   - Status: DRAFT/ACTIVE/ARCHIVED

5. **AnalyticsEvent Entity**
   - Immutable log of views and clicks
   - Links Advertisement and Display
   - Indexed by timestamp for fast range queries
   - Used for CTR (Click-Through Rate) calculation

6. **SystemLog Entity**
   - Audit trail for all user actions
   - Tracks changes to resources
   - Immutable once created
   - Used for compliance and debugging

### Relationships Explained

- **User → Advertisement (1:M)**: One user creates many ads
- **Advertisement ↔ DisplayLoop (M:M)**: Many ads in many loops
- **Display ↔ DisplayLoop (M:M)**: Many displays play many loops
- **Advertisement → AnalyticsEvent (1:M)**: One ad generates many events
- **Display → AnalyticsEvent (1:M)**: One display records many events
- **User → SystemLog (1:M)**: One user generates many log entries

### How to Create in Draw.io

1. Open draw.io
2. File → New → Blank Diagram
3. Search for "Entity Relationship" template
4. Add entities as rectangles
5. Add attributes as rows within rectangles
6. Connect with one-to-many lines
7. Add cardinality labels (1, M)
8. Color code: Blue for User, Green for Advertisement, Purple for Display, etc.

### How to Create in Mermaid

```mermaid
erDiagram
    USER ||--o{ ADVERTISEMENT : creates
    USER ||--o{ DISPLAY : owns
    ADVERTISEMENT ||--o{ DISPLAYLOOP : "contained in"
    DISPLAY ||--o{ DISPLAYLOOP : "played on"
    ADVERTISEMENT ||--o{ ANALYTICEVENT : generates
    DISPLAY ||--o{ ANALYTICEVENT : records
    USER ||--o{ SYSTEMLOG : generates

    USER {
        string id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        string role
        string status
        date createdAt
    }

    ADVERTISEMENT {
        string id PK
        string adName
        string mediaUrl
        string mediaType
        int duration
        string status
        int views
        int clicks
        string advertiserId FK
    }

    DISPLAY {
        string id PK
        string displayId
        string location
        string layout
        object resolution
        object configuration
        string serialNumber UK
        string status
        date lastPing
    }
```

---

## Diagram 2: Use Case Diagram

### Purpose
Shows all actors (user types) and the actions they can perform in the system. This clarifies system boundaries and user permissions.

### Key Elements
- **Actors**: User roles (Advertiser, Operator, Admin)
- **Use Cases**: Actions/features available to actors
- **System Boundary**: Circle around use cases
- **Relationships**: Which actors can perform which actions

### ASCII Visualization

```
                    ┌──────────────────────────────────────┐
                    │        AdMiroTS Platform             │
                    │                                      │
    ┌─────────────┐ │  ┌──────────────────────────────┐  │
    │ Advertiser  │─┼─▶│ Create Advertisement         │  │
    │   (User)    │ │  │ View Ad Analytics            │  │
    │             │ │  │ Manage Display Loops         │  │
    │             │ │  │ Update Profile              │  │
    │             │ │  └──────────────────────────────┘  │
    └─────────────┘ │                                      │
                    │  ┌──────────────────────────────┐  │
    ┌─────────────┐ │  │ View Display Status          │  │
    │ Operator    │─┼─▶│ Monitor Heartbeats           │  │
    │   (User)    │ │  │ Update Display Config        │  │
    │             │ │  │ Manage Display Locations     │  │
    │             │ │  └──────────────────────────────┘  │
    └─────────────┘ │                                      │
                    │  ┌──────────────────────────────┐  │
    ┌─────────────┐ │  │ System Admin Panel           │  │
    │ Admin       │─┼─▶│ User Management              │  │
    │   (User)    │ │  │ View System Logs             │  │
    │             │ │  │ Purge Old Data               │  │
    │             │ │  │ Override Permissions         │  │
    │             │ │  └──────────────────────────────┘  │
    └─────────────┘ │                                      │
                    │  ┌──────────────────────────────┐  │
    ┌─────────────┐ │  │ System (Background)          │  │
    │ Display     │─┼─▶│ Record View/Click Events     │  │
    │ Device      │ │  │ Send Heartbeat Ping          │  │
    │             │ │  │ Log All Actions              │  │
    │             │ │  └──────────────────────────────┘  │
    └─────────────┘ │                                      │
                    │  ┌──────────────────────────────┐  │
    ┌─────────────┐ │  │ External Systems             │  │
    │ Google      │─┼─▶│ OAuth Authentication         │  │
    │ OAuth       │ │  │ Social Login Integration     │  │
    └─────────────┘ │  └──────────────────────────────┘  │
                    │                                      │
                    └──────────────────────────────────────┘
```

### Key Use Cases by Role

**Advertiser Use Cases:**
- Register / Login (OAuth or email)
- View Profile
- Update Profile
- Create Advertisement
- Edit Advertisement
- Delete Advertisement (soft delete)
- Activate/Deactivate Advertisement
- View Advertisement Statistics (views, clicks, CTR)
- Bulk Upload Advertisements
- Create Display Loop
- Assign Ads to Loop
- Deploy Loop to Displays
- View Analytics Dashboard

**Operator Use Cases:**
- Login
- View All Displays
- Check Display Status (online/offline)
- View Display Configuration
- Update Display Configuration
- Update Display Location
- Monitor Heartbeats/Pings
- View System Logs
- Create New Display
- Pair Display via Serial Number

**Admin Use Cases:**
- All Operator capabilities
- Manage Users (create, disable, reset passwords)
- View System Logs (all)
- Purge Old Logs
- System Configuration
- View Project Analytics
- Generate Reports
- Override User Permissions

**System/Device Use Cases:**
- Send Heartbeat Ping (automatic)
- Record View Event (automatic)
- Record Click Event (automatic)
- Log All Actions (automatic)
- Update Display Status (automatic)

### How to Create in Draw.io

1. Open draw.io
2. Create ellipses for use cases
3. Create stick figures for actors
4. Add system boundary box
5. Draw lines between actors and use cases
6. Color code by role
7. Group related use cases

### How to Create in Mermaid

```mermaid
graph LR
    Advertiser[Advertiser]
    Operator[Operator]
    Admin[Admin]
    Device[Display Device]
    
    CreateAd[Create Advertisement]
    ViewStats[View Analytics]
    ManageLoops[Manage Display Loops]
    
    ViewDisplays[View Displays]
    UpdateConfig[Update Configuration]
    Heartbeat[Monitor Heartbeats]
    
    UserMgmt[User Management]
    SystemLogs[View System Logs]
    Reports[Generate Reports]
    
    RecordEvent[Record View/Click]
    SendPing[Send Heartbeat]
    
    Advertiser --> CreateAd
    Advertiser --> ViewStats
    Advertiser --> ManageLoops
    
    Operator --> ViewDisplays
    Operator --> UpdateConfig
    Operator --> Heartbeat
    
    Admin --> UserMgmt
    Admin --> SystemLogs
    Admin --> Reports
    Admin --> Operator
    
    Device --> RecordEvent
    Device --> SendPing
```

---

## Diagram 3: Sequence Diagram - User Registration & Login

### Purpose
Shows the step-by-step flow of authentication. Helps understand security mechanisms and token handling.

### Key Participants
- Client/Frontend
- API Gateway/Middleware
- Authentication Controller
- User Service
- User Repository
- Database
- JWT/Token Manager

### ASCII Visualization

```
Client          API         AuthController    UserService    Repository    Database
  │              │                │               │               │            │
  │─Register────▶│                │               │               │            │
  │   (email,    │─Validate────▶ │               │               │            │
  │   password)  │ Input         │               │               │            │
  │              │◀───Valid───────│               │               │            │
  │              │                │─Hash Pwd────▶│               │            │
  │              │                │◀──Hash──────  │               │            │
  │              │                │─Create────────────────────▶ │            │
  │              │                │   User       │               │─Insert────▶│
  │              │                │              │               │◀──ID───────│
  │              │◀──201 Created──│◀──Return─────│◀──User────────│            │
  │◀─User ID─────│                │               │               │            │
  │   + Token    │                │               │               │            │
  │              │                │               │               │            │
  │─Login────────▶│                │               │               │            │
  │   (email,    │─Validate────▶ │               │               │            │
  │   password)  │ Creds         │               │               │            │
  │              │◀───Valid───────│               │               │            │
  │              │                │─Find────────────────────────▶│            │
  │              │                │   User       │               │─Query────▶ │
  │              │                │              │               │◀──User────│
  │              │                │◀──User────────│◀──User────────│            │
  │              │                │               │               │            │
  │              │                │─Verify───────▶│               │            │
  │              │                │  Password     │               │            │
  │              │◀──200 OK────────│◀──Match──────│               │            │
  │◀─Token─      │                │               │               │            │
  │   + User     │                │               │               │            │
  │              │                │               │               │            │
  │ (Future)     │                │               │               │            │
  │─API Call─────▶─Authorization──▶─Verify Token──────────────────────────────│
  │ + Token      │                │-Generate JWT─────────────────────────────▶│
  │              │                │                                           │
  │◀─Response────│◀──200 OK────────│◀──Valid────────────────────────────────│
  │              │                │               │               │            │
```

### Step-by-Step Flow

**Registration (POST /api/auth/register)**
1. Client submits email, password, firstName, lastName
2. API Gateway validates content-type and format
3. AuthController receives request
4. Validation middleware checks email format and password strength
5. UserService hashes password with bcrypt (10 rounds)
6. UserService checks if email already exists in database
7. UserRepository creates new User document
8. Database returns created user with ID
9. AuthService generates JWT token
10. Response sent: 201 Created with user object and token
11. Client stores token in localStorage/sessionStorage

**Login (POST /api/auth/login)**
1. Client submits email and password
2. API Gateway validates request
3. AuthController delegates to AuthService
4. AuthService finds user by email in database
5. If user not found → 404 NotFound error
6. AuthService compares submitted password with stored hash (bcrypt.compare)
7. If password doesn't match → increment failed attempts
8. If failed attempts > 5 → lock account for 5+ minutes
9. If password matches → generate JWT token
10. AuthService updates lastLogin timestamp
11. Response sent: 200 OK with token and user profile
12. Client receives token for future API calls

**Token Structure (JWT)**
```
Header:   { alg: "HS256", typ: "JWT" }
Payload:  {
            id: "user_123",
            email: "user@example.com",
            role: "ADVERTISER",
            iat: 1712681800,
            exp: 1712768200
          }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### How to Create in Mermaid

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Auth as AuthController
    participant Service as AuthService
    participant Repo as UserRepository
    participant DB as MongoDB

    rect rgb(200, 220, 255)
    Note over Client,DB: REGISTRATION FLOW
    Client->>API: POST /auth/register
    API->>Auth: { email, password, firstName, lastName }
    Auth->>Service: validateAndCreateUser()
    Service->>Service: bcrypt.hash(password)
    Service->>Repo: findByEmail(email)
    Repo->>DB: Query: { email }
    DB-->>Repo: user not found
    Repo-->>Service: null
    Service->>Repo: create(userData)
    Repo->>DB: Insert new user
    DB-->>Repo: userId
    Repo-->>Service: User object
    Service->>Service: generateJWT(userId)
    Service-->>Auth: { user, token }
    Auth-->>API: 201 Created
    API-->>Client: { success, data: { user, token } }
    end

    rect rgb(220, 255, 220)
    Note over Client,DB: LOGIN FLOW
    Client->>API: POST /auth/login
    API->>Auth: { email, password }
    Auth->>Service: authenticateUser()
    Service->>Repo: findByEmail(email)
    Repo->>DB: Query: { email }
    DB-->>Repo: User document
    Repo-->>Service: User object
    Service->>Service: bcrypt.compare(password, hash)
    alt Password matches
        Service->>Repo: updateLastLogin()
        Repo->>DB: Update lastLogin timestamp
        Service->>Service: generateJWT(userId)
        Service-->>Auth: { user, token }
        Auth-->>API: 200 OK
        API-->>Client: { success, data: { user, token } }
    else Password incorrect
        Service->>Repo: incrementFailedAttempts()
        Repo->>DB: Update failedAttempts
        Service-->>Auth: ValidationError
        Auth-->>API: 401 Unauthorized
        API-->>Client: { success: false, error: "Invalid password" }
    end
    end
```

---

## Diagram 4: Sequence Diagram - Advertisement Creation & Display

### Purpose
Shows how advertisements are created, deployed, displayed, and tracked.

### Key Participants
- Advertiser (Client)
- API Gateway
- AdvertisementController
- AdvertisementService
- DisplayService
- DisplayLoopService
- Repositories
- Analytics Service
- Database

### ASCII Visualization

```
Advertiser      API         AdController     AdService      DispService    Analytics      DB
    │            │               │               │               │              │           │
    │─POST────────▶               │               │               │              │           │
    │ Create Ad   │────Validate─▶│               │               │              │           │
    │             │◀──Valid──────│               │               │              │           │
    │             │               │─Create Ad────▶│               │              │           │
    │             │               │               │─Insert───────────────────────────────▶│
    │             │               │               │               │              │           │
    │             │               │◀──AdId────────│               │              │           │
    │             │◀──201────────────Ad Object────│               │              │           │
    │◀─Ad Created─│               │               │               │              │           │
    │    + ID     │               │               │               │              │           │
    │             │               │               │               │              │           │
    │─Activate────▶               │               │               │              │           │
    │   Ad        │────Validate─▶│               │               │              │           │
    │             │◀──Valid──────│               │               │              │           │
    │             │               │─Update Status────────────────────────────────────────▶│
    │             │               │  DRAFT→ACTIVE                │              │           │
    │             │◀──200────────────ACTIVE──────│               │              │           │
    │◀─Status OK  │               │               │               │              │           │
    │             │               │               │               │              │           │
    │─Create Loop─▶               │               │               │              │           │
    │  with Ads   │────────────────────────────────────Validate──▶│              │           │
    │             │                               │◀───Valid─────│              │           │
    │             │                               │               │─Insert──────────────────▶│
    │             │                               │               │◀──LoopId────────────────│
    │             │◀──201─────────────────────────────Loop────────│              │           │
    │◀─Loop       │               │               │               │              │           │
    │   Created   │               │               │               │              │           │
    │             │               │               │               │              │           │
    │─Deploy──────▶               │               │               │              │           │
    │  Loop       │────────────────────────────Deploy──────────▶│              │           │
    │  to Disp    │               │               │               │─Assign───────────────────▶│
    │             │               │               │               │◀──OK─────────────────────│
    │             │               │               │               │              │           │
    │             │               │               │               │Log Deploy Event────────▶│
    │             │◀──200────────────Loop────────────Deployed────│              │           │
    │◀─Deployed   │               │               │               │              │           │
    │             │               │               │               │              │           │
    │─View Stats──▶               │               │               │              │           │
    │             │─GetAnalytics──▶─Read Views/Clicks─────────────────────────▶│           │
    │             │               │                               │              │─Query────▶│
    │             │               │                               │              │◀──Events─│
    │             │               │◀────────────Aggregate Results───────────────│           │
    │             │◀──200──────────Ad Stats: Views, Clicks, CTR──│              │           │
    │◀─CTR: 6.5%  │               │               │               │              │           │
    │             │               │               │               │              │           │
```

### Step-by-Step Flow

**1. Create Advertisement (POST /api/advertisements)**
- Advertiser submits: adName, mediaUrl, mediaType, duration, description
- Controller validates input with Zod schema
- Service checks field lengths and media URL validity
- Service creates Advertisement entity with status = "DRAFT"
- Repository inserts into database
- Response: 201 Created with advertisement ID and details

**2. Activate Advertisement (POST /api/advertisements/:id/activate)**
- Advertiser requests to activate
- Service finds advertisement by ID
- Service updates status: DRAFT → ACTIVE
- SystemLog records: "Advertisement Activated"
- Response: 200 OK with updated status

**3. Create Display Loop (POST /api/display-loops)**
- Advertiser organizes ACTIVE ads into a loop
- Service validates: all ads exist and are ACTIVE
- Service creates DisplayLoop with advertisements array
- Repository inserts into database
- Response: 201 Created with loop ID

**4. Deploy Loop to Displays (POST /api/display-loops/:id/deploy)**
- Advertiser selects which displays should show this loop
- Service finds loop and validates it contains active ads
- Service finds all selected displays
- Service updates display's assigned loop
- Analytics service logs: "Loop Deployed to Display X"
- Each display receives update next heartbeat
- Response: 200 OK with deployment confirmation

**5. Display Device Shows Advertisement**
- Display polls for new content (or receives push)
- Display downloads loop and advertisement media
- Display plays advertisement for duration specified
- After each view, device sends: POST /api/analytics/record-view
- With: { advertisementId, displayId, duration }
- Analytics service creates AnalyticsEvent record
- AnalyticsEvent indexed by timestamp for fast queries

**6. Track Engagement (GET /api/advertisements/:id/stats)**
- Advertiser requests statistics
- Service queries AnalyticsEvent collection
- Service aggregates:
  - totalViews = count of VIEW events
  - totalClicks = count of CLICK events
  - CTR = (clicks / views) × 100
  - displayCount = distinct displays showing this ad
- Response: 200 OK with statistics

### How to Create in Mermaid

```mermaid
sequenceDiagram
    participant Adv as Advertiser
    participant API as API
    participant AC as AdController
    participant AS as AdService
    participant AR as AdRepository
    participant DB as MongoDB
    participant Analytics as Analytics

    rect rgb(200, 220, 255)
    Note over Adv,DB: CREATE & ACTIVATE ADVERTISEMENT
    Adv->>API: POST /advertisements
    API->>AC: Create request
    AC->>AS: validateAndCreate()
    AS->>AR: create(adData)
    AR->>DB: Insert Advertisement
    DB-->>AR: advertisementId
    AR-->>AS: Ad object
    AS-->>AC: Created
    AC-->>API: 201 Created
    API-->>Adv: { id, status: DRAFT }
    
    Adv->>API: POST /advertisements/:id/activate
    API->>AC: Activate request
    AC->>AS: activate(id)
    AS->>AR: update(id, { status: ACTIVE })
    AR->>DB: Update status
    DB-->>AR: Updated
    AR-->>AS: Ad object
    AS->>Analytics: log(action: "Ad Activated")
    Analytics-->>AS: Logged
    AS-->>AC: Updated
    AC-->>API: 200 OK
    API-->>Adv: { status: ACTIVE }
    end

    rect rgb(220, 255, 220)
    Note over Adv,Analytics: DISPLAY & TRACK
    Adv->>API: GET /advertisements/:id/stats
    API->>AC: Get stats request
    AC->>Analytics: getStats(advertisementId)
    Analytics->>DB: Query AnalyticsEvents
    DB-->>Analytics: View & Click events
    Analytics->>Analytics: Aggregate: views, clicks, CTR
    Analytics-->>AC: Statistics
    AC-->>API: 200 OK
    API-->>Adv: { views: 1250, clicks: 87, ctr: 6.96 }
    end
```

---

## Diagram 5: Component Architecture Diagram

### Purpose
Shows how the system is organized into logical components and how they interact.

### Key Components
- API Gateway (Express.js)
- Middleware Layer (CORS, Auth, Validation, Rate Limiting, Error Handler)
- Controller Layer (7 controllers)
- Service Layer (7 services)
- Repository Layer (6 repositories)
- Database Layer (MongoDB)
- External Services (OAuth, etc.)

### ASCII Visualization

```
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL CLIENTS                              │
│  (Frontend App, Mobile App, Postman, Display Devices)            │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP/HTTPS
┌────────────────────────▼─────────────────────────────────────────┐
│                   EXPRESS.JS API SERVER                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────── MIDDLEWARE LAYER ─────────────────────┐   │
│  │ • CORS Middleware          (Allow cross-origin requests)    │   │
│  │ • Body Parser              (Parse JSON requests)             │   │
│  │ • Request Logger           (Log all requests)                │   │
│  │ • JWT Auth Middleware      (Verify tokens)                   │   │
│  │ • Validation Middleware    (Zod schema validation)           │   │
│  │ • Rate Limiter             (Prevent abuse)                   │   │
│  │ • Error Handler            (Catch & format errors)           │   │
│  │ • Response Formatter       (Consistent JSON responses)       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────── ROUTER LAYER ─────────────────────┐   │
│  │ /api/auth           → AuthController                    │   │
│  │ /api/advertisements → AdvertisementController          │   │
│  │ /api/displays       → DisplayController                │   │
│  │ /api/profile        → ProfileController                │   │
│  │ /api/display-loops  → DisplayLoopController (⏳)        │   │
│  │ /api/analytics      → AnalyticsController (⏳)          │   │
│  │ /api/system-logs    → SystemLogController (⏳)          │   │
│  └────────────────────────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 CONTROLLER LAYER                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │ AuthController │  │AdController    │                 │  │
│  │  │ (7 methods)    │  │(10 methods)    │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │DisplayController│ │ProfileController│                │  │
│  │  │(11 methods)    │  │(4 methods)     │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────┐  │  │
│  │  │DisplayLoop     │  │AnalyticsController│SystemLog │  │  │
│  │  │Controller (⏳) │  │Controller (⏳)    │Ctrl (⏳) │  │  │
│  │  └────────────────┘  └────────────────┘  └──────────┘  │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                SERVICE LAYER (Business Logic)           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  AuthService      │ AdvertisementService                │  │
│  │  ProfileService   │ DisplayService                      │  │
│  │  DisplayLoopService (⏳)                                 │  │
│  │  AnalyticsService (⏳)  │ SystemLogService (⏳)          │  │
│  │                                                          │  │
│  │  Shared:                                                 │  │
│  │  • JWT/Token Management                                 │  │
│  │  • Password Hashing (bcrypt)                            │  │
│  │  • Validation & Error Handling                          │  │
│  │  • Logging                                              │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           REPOSITORY LAYER (Data Access)               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  BaseRepository<T>     (Generic CRUD operations)        │  │
│  │    ├─ UserRepository                                    │  │
│  │    ├─ AdvertisementRepository                           │  │
│  │    ├─ DisplayRepository                                 │  │
│  │    ├─ DisplayLoopRepository (⏳)                        │  │
│  │    ├─ AnalyticsRepository (⏳)                          │  │
│  │    └─ SystemLogRepository (⏳)                          │  │
│  │                                                          │  │
│  │  Features:                                               │  │
│  │  • Pagination & Filtering                               │  │
│  │  • Entity Instantiation                                 │  │
│  │  • Custom Finder Methods                                │  │
│  │  • Error Handling                                       │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               DOMAIN LAYER (Entity Models)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Entities:                                               │  │
│  │  • User          • Advertisement                        │  │
│  │  • Display       • DisplayLoop (⏳)                     │  │
│  │  • AnalyticsEvent (⏳)  • SystemLog (⏳)                │  │
│  │                                                          │  │
│  │  Enums:                                                  │  │
│  │  • UserRole, AdStatus, DisplayStatus, LogType          │  │
│  │                                                          │  │
│  │  Value Objects:                                          │  │
│  │  • Resolution, DisplayConfiguration                     │  │
│  │  • EngagementMetrics                                    │  │
│  │                                                          │  │
│  │  Interfaces:                                             │  │
│  │  • IUser, IAdvertisement, IDisplay, etc.               │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼───────────────────────────────────────┐
│                  MONGODB DATABASE                                │
├───────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  • users           • advertisements                            │
│  • displays        • display_loops (⏳)                        │
│  • analytics_events (⏳)  • system_logs (⏳)                   │
│                                                                  │
│  Indexes:                                                        │
│  • users: { email: 1 } (unique)                                │
│  • advertisements: { advertiserId, status, createdAt }         │
│  • displays: { serialNumber, location, status }                │
│  • analytics_events: { timestamp, advertisementId, displayId } │
│  • system_logs: { timestamp, userId, type }                   │
│                                                                  │
└───────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**API Gateway (Express.js)**
- Route requests to appropriate controllers
- Apply middleware in order
- Handle connection and timeout issues

**Middleware Layer**
- CORS: Allow frontend domain
- JWT Auth: Verify token on protected routes
- Validation: Check input against Zod schemas
- Rate Limit: Prevent abuse
- Error Handler: Catch thrown errors and format response

**Controller Layer**
- Parse HTTP requests
- Call appropriate service methods
- Format responses as JSON
- Return proper HTTP status codes

**Service Layer**
- Business logic implementation
- Data validation
- Cross-service coordination
- Error handling with proper error types

**Repository Layer**
- Abstract database queries
- Provide consistent CRUD interface
- Handle data pagination and filtering
- Return domain entities (not raw database documents)

**Domain Layer**
- Entity definitions with validation
- Business rule enforcement
- Type safety and contracts
- Enum and value object definitions

**Database**
- Persistent data storage
- Indexes for query performance
- Transaction support (if needed)

---

## Diagram 6: Class Diagram - Core Entities

### Purpose
Shows the object-oriented structure of main entities, their properties, and relationships.

### Key Classes
- User
- Advertisement
- Display
- DisplayLoop
- AnalyticsEvent
- SystemLog

### ASCII Visualization

```
┌─────────────────────────────────────┐
│          <<interface>>              │
│            IUser                    │
├─────────────────────────────────────┤
│ + id: string                        │
│ + email: string                     │
│ + firstName: string                 │
│ + lastName: string                  │
│ + passwordHash: string              │
│ + role: UserRole                    │
│ + status: UserStatus                │
│ + createdAt: Date                   │
│ + updatedAt: Date                   │
├─────────────────────────────────────┤
│ + getFullName(): string             │
│ + toSafeObject(): IUserSafe         │
│ + updateLastLogin(): void           │
│ + deactivate(): void                │
│ + changePassword(pwd): void         │
└─────────────────────────────────────┘
         ▲
         │ implements
         │
┌─────────────────────────────────────┐
│         User (extends Entity)        │
├─────────────────────────────────────┤
│ - email: string                     │
│ - passwordHash: string              │
│ - profile: UserProfile              │
│ - role: UserRole                    │
│ - status: UserStatus                │
│ - lastLogin?: Date                  │
│ - failedAttempts: number            │
│ - lockedUntil?: Date                │
├─────────────────────────────────────┤
│ + getFullName(): string             │
│ + toDTO(): UserDTO                  │
│ + toSafeObject(): object            │
│ + comparePassword(pwd): boolean     │
│ + lock(duration: number): void      │
│ + unlock(): void                    │
└─────────────────────────────────────┘
         │
         │ 1:M creates
         ▼
┌─────────────────────────────────────┐
│      Advertisement                  │
├─────────────────────────────────────┤
│ - id: string (PK)                   │
│ - adName: string                    │
│ - mediaUrl: string                  │
│ - mediaType: MediaType              │
│ - duration: number (seconds)        │
│ - description?: string              │
│ - targetAudience?: string           │
│ - fileSize?: number                 │
│ - status: AdStatus                  │
│ - views: number = 0                 │
│ - clicks: number = 0                │
│ - advertiserId: string (FK)         │
│ - createdAt: Date                   │
│ - updatedAt: Date                   │
│ - deletedAt?: Date                  │
├─────────────────────────────────────┤
│ + getStats(): AdStats               │
│ + activate(): void                  │
│ + deactivate(): void                │
│ + incrementViews(): void            │
│ + incrementClicks(): void           │
│ + getClickThroughRate(): number     │
│ + toDTO(): AdvertisementDTO         │
└─────────────────────────────────────┘
         │
         │ M:M contained in
         ▼
┌─────────────────────────────────────┐
│      DisplayLoop (⏳)                │
├─────────────────────────────────────┤
│ - id: string (PK)                   │
│ - name: string                      │
│ - description?: string              │
│ - advertisements: string[] (FK)     │
│ - displayIds?: string[] (FK)        │
│ - loopCount?: number                │
│ - playbackDuration: number          │
│ - status: LoopStatus                │
│ - createdBy: string (FK)            │
│ - createdAt: Date                   │
│ - deployedAt?: Date                 │
├─────────────────────────────────────┤
│ + addAdvertisement(adId): void      │
│ + removeAdvertisement(adId): void   │
│ + assignToDisplay(dispId): void     │
│ + deploy(): void                    │
│ + archive(): void                   │
│ + getTotalDuration(): number        │
│ + toDTO(): DisplayLoopDTO           │
└─────────────────────────────────────┘
         │
         │ M:M played on
         ▼
┌─────────────────────────────────────┐
│         Display                     │
├─────────────────────────────────────┤
│ - id: string (PK)                   │
│ - displayId: string                 │
│ - location: string                  │
│ - layout: LayoutType                │
│ - resolution: Resolution            │
│ - configuration: DisplayConfig      │
│ - serialNumber?: string (UNIQUE)    │
│ - status: DisplayStatus             │
│ - isConnected: boolean              │
│ - lastPing?: Date                   │
│ - connectionToken: string           │
│ - currentLoopId?: string            │
│ - createdAt: Date                   │
│ - deletedAt?: Date                  │
├─────────────────────────────────────┤
│ + ping(): void                      │
│ + isOnline(): boolean               │
│ + updateConfig(config): void        │
│ + updateLocation(loc): void         │
│ + assignLoop(loopId): void          │
│ + getStatus(): DisplayStatus        │
│ + toDTO(): DisplayDTO               │
└─────────────────────────────────────┘
         │
         │ 1:M generates
         ▼
┌─────────────────────────────────────┐
│    AnalyticsEvent (⏳)              │
├─────────────────────────────────────┤
│ - id: string (PK)                   │
│ - type: EventType (VIEW/CLICK)      │
│ - advertisementId: string (FK)      │
│ - displayId: string (FK)            │
│ - userId?: string (FK)              │
│ - duration?: number                 │
│ - timestamp: Date (indexed)         │
│ - metadata?: Record<string, any>    │
├─────────────────────────────────────┤
│ + toDTO(): AnalyticsEventDTO        │
└─────────────────────────────────────┘
         │
         │ logged by
         ▼
┌─────────────────────────────────────┐
│     SystemLog (⏳)                  │
├─────────────────────────────────────┤
│ - id: string (PK)                   │
│ - type: LogType                     │
│ - action: string                    │
│ - userId?: string (FK)              │
│ - resourceType?: string             │
│ - resourceId?: string               │
│ - changes?: {before, after}         │
│ - status: LogStatus                 │
│ - errorMessage?: string             │
│ - ipAddress: string                 │
│ - userAgent: string                 │
│ - timestamp: Date (indexed)         │
│ - metadata?: Record<string, any>    │
├─────────────────────────────────────┤
│ + toDTO(): SystemLogDTO             │
└─────────────────────────────────────┘
```

### Enumerations

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  ADVERTISER = "ADVERTISER",
  OPERATOR = "OPERATOR"
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED"
}

enum AdStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED"
}

enum DisplayStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  INACTIVE = "INACTIVE"
}

enum LoopStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED"
}

enum EventType {
  VIEW = "VIEW",
  CLICK = "CLICK",
  IMPRESSION = "IMPRESSION"
}

enum LogType {
  USER_ACTION = "USER_ACTION",
  SYSTEM_EVENT = "SYSTEM_EVENT",
  ERROR = "ERROR",
  PERFORMANCE = "PERFORMANCE"
}
```

### Value Objects

```typescript
interface Resolution {
  width: number
  height: number
}

interface DisplayConfiguration {
  brightness: number (0-100)
  volume: number (0-100)
  refreshRate: number
  orientation: "LANDSCAPE" | "PORTRAIT"
}

interface EngagementMetrics {
  views: number
  clicks: number
  clickThroughRate: number
  displayCount: number
}
```

### How to Create in PlantUML

```
@startuml
class User {
    - id: string
    - email: string
    - firstName: string
    - lastName: string
    - passwordHash: string
    - role: UserRole
    - status: UserStatus
    + getFullName(): string
    + toSafeObject(): object
}

class Advertisement {
    - id: string
    - adName: string
    - mediaUrl: string
    - mediaType: MediaType
    - status: AdStatus
    - views: number
    - clicks: number
    - advertiserId: string
    + activate(): void
    + incrementViews(): void
}

class Display {
    - id: string
    - displayId: string
    - location: string
    - status: DisplayStatus
    - configuration: DisplayConfig
    + ping(): void
    + isOnline(): boolean
}

User "1" --* "M" Advertisement : creates
Advertisement "M" --* "M" Display : "displays on"

@enduml
```

---

## Diagram 7: Advertisement Lifecycle State Diagram

### Purpose
Shows all possible states an advertisement can be in and valid transitions between them.

### States
1. **DRAFT** - Initial state after creation
2. **ACTIVE** - Currently being displayed
3. **PAUSED** - Temporarily stopped
4. **EXPIRED** - Time period has ended

### ASCII Visualization

```
                    ┌──────────────┐
                    │   CREATED    │
                    │   (DRAFT)    │
                    └──────┬───────┘
                           │
                  activate()│
                           ▼
                    ┌──────────────┐
      ┌────────────→│   ACTIVE     │◄────────────┐
      │             │              │             │
      │  resume()   └──────┬───────┘             │
      │                    │                     │ resume()
      │             pause()│                     │
      │                    ▼                     │
      │             ┌──────────────┐            │
      │             │   PAUSED     │────────────┘
      │             │              │
      │             └──────────────┘
      │                    │
      │          deactivate()
      │                    ▼
      │             ┌──────────────┐
      │             │   EXPIRED    │
      │             │              │
      │             └──────────────┘
      │
      │ (Time-based: after duration elapsed)
      │ (System automatically)
      │
      └─────────────────────────────

State Transitions Table:
┌─────────┬────────────────────────────────────────┐
│ FROM    │ TO            │ Trigger              │ Actor   │
├─────────┼───────────────┼──────────────────────┼─────────┤
│ DRAFT   │ ACTIVE        │ User activates       │ Auth    │
│ ACTIVE  │ PAUSED        │ User pauses          │ Auth    │
│ PAUSED  │ ACTIVE        │ User resumes         │ Auth    │
│ ACTIVE  │ EXPIRED       │ Duration elapsed     │ System  │
│ PAUSED  │ EXPIRED       │ Duration elapsed     │ System  │
│ ANY     │ (DELETED)     │ Soft delete          │ Auth    │
└─────────┴───────────────┴──────────────────────┴─────────┘

Activities per State:
┌──────────┬────────────────────────────────────────────┐
│ DRAFT    │ • Advertisers can edit all properties     │
│          │ • Cannot be displayed yet                 │
│          │ • Can be activated when ready             │
├──────────┼────────────────────────────────────────────┤
│ ACTIVE   │ • Being displayed on screens             │
│          │ • Tracking views and clicks              │
│          │ • Can be paused temporarily              │
│          │ • Statistics being collected             │
├──────────┼────────────────────────────────────────────┤
│ PAUSED   │ • Not displayed on any screens           │
│          │ • Can be resumed later                   │
│          │ • Previous stats are preserved           │
├──────────┼────────────────────────────────────────────┤
│ EXPIRED  │ • No longer active (duration exceeded)   │
│          │ • Final statistics preserved             │
│          │ • Archived for historical analysis       │
└──────────┴────────────────────────────────────────────┘
```

### Guard Conditions

```
activate():
  - Only DRAFT state allowed
  - User must be authenticated
  - Must be ad owner or admin
  - If success: DRAFT → ACTIVE, log event

pause():
  - Only ACTIVE state allowed
  - User must be ad owner or admin
  - If success: ACTIVE → PAUSED, log event

resume():
  - Only PAUSED state allowed
  - User must be ad owner or admin
  - If success: PAUSED → ACTIVE, log event

expire() [automatic]:
  - Check if current_time > created_at + duration
  - If true: Any state → EXPIRED

deactivate() [soft delete]:
  - User must be ad owner or admin
  - Set deletedAt timestamp
  - Exclude from queries by default
```

### How to Create in Draw.io

1. Create rounded rectangles for states
2. Label: STATE_NAME inside
3. Draw directed arrows between states
4. Label arrows with trigger/action
5. Use guard conditions in brackets [ ]
6. Color: Green for DRAFT, Blue for ACTIVE, Yellow for PAUSED, Red for EXPIRED

---

## Diagram 8: Display Lifecycle State Diagram

### Purpose
Shows possible states a display device can be in, based on connection status and activity.

### States
1. **OFFLINE** - Initial state, not connected
2. **ONLINE** - Connected and actively receiving heartbeats
3. **INACTIVE** - Manually disabled/deactivated

### ASCII Visualization

```
            ┌─────────────────────────┐
            │      OFFLINE            │
            │  (Initial State)        │
            │  (No Heartbeat)         │
            └────────┬────────────────┘
                     │
        pair/ping    │  (Display sends
        heartbeat    │   first ping)
                     ▼
            ┌─────────────────────────┐
        ┌──→│      ONLINE             │◄──┐
        │   │  (Connected)            │   │
        │   │  (Receiving Heartbeats) │   │
        │   └────────┬────────────────┘   │
        │            │                     │
        │   deactivate()│                   │
        │            │                     │
        │            ▼                     │
        │   ┌─────────────────────────┐   │
        │   │     INACTIVE            │   │
        │   │  (Manually Disabled)    │   │
        │   │  (Not Receiving Loops)  │   │
        │   └────────┬────────────────┘   │
        │            │                    │
        │   reactivate()│                  │
        │            │                    │
        └────────────┴────────────────────┘

Heartbeat Monitoring:
• Display must ping within 5-minute window
• If no ping received for 5+ minutes → ONLINE becomes OFFLINE
• heartbeat ping() resets timer and keeps ONLINE
• Missed heartbeats = connection lost (show as OFFLINE)

State Transitions:
┌──────────┬──────────┬────────────────┬────────────┐
│ FROM     │ TO       │ Trigger        │ Actor      │
├──────────┼──────────┼────────────────┼────────────┤
│ OFFLINE  │ ONLINE   │ First ping     │ Device     │
│ ONLINE   │ OFFLINE  │ No ping > 5min │ System     │
│ ONLINE   │ INACTIVE │ User deactivate│ Operator   │
│ INACTIVE │ ONLINE   │ User reactivate│ Operator   │
│ OFFLINE  │ OFFLINE  │ (timeout)      │ System     │
└──────────┴──────────┴────────────────┴────────────┘

Display Configuration Allowed Per State:
┌──────────┬──────────────────────────────────┐
│ OFFLINE  │ • Can be updated remotely        │
│          │ • Config applied when comes back │
├──────────┼──────────────────────────────────┤
│ ONLINE   │ • Config updates immediate      │
│          │ • Changes pushed to device      │
│          │ • Content served instantly      │
├──────────┼──────────────────────────────────┤
│ INACTIVE │ • Cannot receive content        │
│          │ • Config queued for activation  │
└──────────┴──────────────────────────────────┘
```

### Health Check Algorithm

```
HEARTBEAT_WINDOW = 5 minutes
CURRENT_TIME = now()
LAST_PING_TIME = display.lastPing

if CURRENT_TIME - LAST_PING_TIME > HEARTBEAT_WINDOW:
    display.status = OFFLINE
else:
    display.status = ONLINE

On Display Ping Request:
1. Update display.lastPing = CURRENT_TIME
2. Set display.status = ONLINE
3. Send any pending configurations
4. Confirm heartbeat received
5. Log heartbeat event
```

---

## Diagram 9: API Gateway & Middleware Flow

### Purpose
Shows how a request flows through middleware layers and how errors are handled.

### Middleware Stack (Order Matters)

```
HTTP Request Arrives
    │
    ▼
┌─────────────────────────────────────┐
│ 1. CORS Middleware                  │
│ • Check Origin header               │
│ • Allow/deny cross-origin requests  │
│ • Add CORS headers                  │
├─────────────────────────────────────┤
│ Allow: Only whitelisted domains     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. Body Parser Middleware           │
│ • Parse JSON body                   │
│ • Limit payload size (10MB)         │
│ • Detect content-type               │
├─────────────────────────────────────┤
│ If error (invalid JSON) → 400 Bad   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Request Logger Middleware        │
│ • Log method, path, timestamp       │
│ • Log request headers               │
│ • Start timing                      │
├─────────────────────────────────────┤
│ Logged to console/file              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Rate Limiter Middleware          │
│ • Track IP + endpoint               │
│ • Count requests in time window     │
│ • Check against limit               │
├─────────────────────────────────────┤
│ General: 20 req/min per IP          │
│ Auth: 5 failed attempts → lockout   │
│ If exceeded → 429 Too Many Requests │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 5. JWT Auth Middleware              │
│ (Only for protected routes)         │
│ • Extract Authorization header      │
│ • Verify JWT signature              │
│ • Validate expiration               │
│ • Attach user to req.user           │
├─────────────────────────────────────┤
│ If no token → 401 Unauthorized      │
│ If invalid → 401 Unauthorized       │
│ If expired → 401 Token Expired      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 6. Request Validation Middleware    │
│ (If validation schema provided)     │
│ • Parse request body/query          │
│ • Validate against Zod schema       │
│ • Coerce types (string→number)      │
│ • Return typed object               │
├─────────────────────────────────────┤
│ If invalid → 400 Bad Request        │
│ With field-level error messages     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 7. Route Handler / Controller       │
│ • Extract params/query/body         │
│ • Call service method               │
│ • Get response from service         │
│ • Throw error if needed             │
├─────────────────────────────────────┤
│ Exception: Error thrown from handler│
│ Normal: Response object returned    │
└─────────────────────────────────────┘
    │
    ├─── Success Path ───┐
    │                    ▼
    │            ┌──────────────────┐
    │            │ Format Response  │
    │            │ {success, data}  │
    │            └──────┬───────────┘
    │                   │
    │                   ▼
    │            ┌──────────────────┐
    │            │ Set Status Code  │
    │            │ (200, 201, etc)  │
    │            └──────┬───────────┘
    │                   │
    │                   ▼
    │            ┌──────────────────┐
    │            │ Send JSON + Log  │
    │            │ response complete│
    │            └──────────────────┘
    │
    └─── Error Path ───┐
                       ▼
            ┌──────────────────────────┐
            │ Error Thrown (try-catch) │
            └──────┬───────────────────┘
                   │
                   ▼
            ┌──────────────────────────┐
            │ 8. Error Handler         │
            │ Middleware               │
            │ • Catch all errors       │
            │ • Identify error type    │
            │ • Format error response  │
            │ • Log error details      │
            │ • Hide stack trace (prod)│
            ├──────────────────────────┤
            │ ValidationError:         │
            │  → 400 Bad Request       │
            │ NotFoundError:           │
            │  → 404 Not Found         │
            │ UnauthorizedError:       │
            │  → 401 Unauthorized      │
            │ ConflictError:           │
            │  → 409 Conflict          │
            │ AppError (generic):      │
            │  → 500 Internal Server   │
            └──────┬───────────────────┘
                   │
                   ▼
            ┌──────────────────────────┐
            │ Format Error Response    │
            │ {                        │
            │  success: false,         │
            │  error: ErrorType,       │
            │  message: "...",         │
            │  statusCode: 400+        │
            │ }                        │
            └──────┬───────────────────┘
                   │
                   ▼
            ┌──────────────────────────┐
            │ Send Error + Log         │
            │ response complete        │
            └──────────────────────────┘

Client Receives Response
    │
    ▼
Either:
• { success: true, data: {...} } [200-201]
• { success: false, error: "...", message: "..." } [4xx-5xx]
```

### Request/Response Flow Examples

**Successful Request Example:**
```
1. POST /api/advertisements HTTP/1.1
2. Headers: Content-Type: application/json, Authorization: Bearer token
3. Body: { adName: "Sale", mediaUrl: "...", mediaType: "IMAGE", duration: 30 }
4. Passes through middleware: CORS → BodyParser → Logger → RateLimit → JWT → Validation
5. Controller receives clean req with req.user and req.body (validated)
6. Service executes business logic
7. Repository returns created Advertisement entity
8. Controller formats response: { success: true, data: advertisement }
9. Sent to client: 201 Created + JSON response
```

**Failed Request Example:**
```
1. POST /api/advertisements HTTP/1.1
2. Headers: (missing Authorization)
3. Body: (valid JSON)
4. Passes: CORS → BodyParser → Logger → RateLimit
5. JWT Middleware: No Authorization header found
6. Throws UnauthorizedError
7. Error Handler catches error
8. Formats response: { success: false, error: "Unauthorized", message: "User not authenticated" }
9. Sent to client: 401 Unauthorized + JSON response
```

---

## Diagram 10: Data Flow Diagram (DFD)

### Purpose
Shows how data moves through the system from external sources to storage and back.

### Levels of DFD
- **Level 0** (Context): System as a single process
- **Level 1** (Overview): Major processes and data stores
- **Level 2** (Detailed): Specific processes and data flows

### ASCII - Level 1 DFD

```
External Entities (Sources/Sinks):
┌──────────────┐          ┌──────────────┐
│  Advertiser  │          │   Operator   │
│    (User)    │          │    (User)    │
└──────┬───────┘          └──────┬───────┘
       │                         │
       │ 1. Create/Edit Ads      │ 5. Manage Displays
       │ 2. View Analytics       │ 6. Monitor Status
       │ 3. Manage Loops         │ 7. Update Config
       │ 4. Deploy to Displays   │ 8. Check Heartbeats
       │                         │
       └────────────┬────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  API / Web Server    │
         │                      │
         │ • Routes             │
         │ • Controllers        │
         │ • Middleware         │
         │ • Error Handling     │
         └────────┬─────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│Services  │ │Services  │ │Services  │
│(Business │ │(Data     │ │(Analytics│
│Logic)    │ │Mgmt)     │ │Events)   │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └─────┬──────┴────────┬───┘
           │               │
           ▼               ▼
     ┌──────────────┐ ┌──────────────┐
     │Repositories │ │Repositories  │
     │(Data Access)│ │(Data Access) │
     └────────┬────┘ └────────┬─────┘
              │               │
              └───────┬───────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  MongoDB Database    │
           │                      │
           │ Collections:         │
           │ • users              │
           │ • advertisements     │
           │ • displays           │
           │ • display_loops      │
           │ • analytics_events   │
           │ • system_logs        │
           └──────────────────────┘

Data Flows:

Advertiser → API:
  • POST /advertisements (adName, mediaUrl, duration, ...)
  • PUT /advertisements/:id (updates)
  • POST /advertisements/:id/activate
  • GET /advertisements/:id/stats (with engagement data)

API → Database:
  • INSERT advertisements
  • UPDATE advertisements (status, views, clicks)
  • SELECT from analytics_events (for stats)
  • INSERT analytics_events (views/clicks)
  • INSERT system_logs (audit trail)

Database → API:
  • Advertisement documents (with full data)
  • Analytics events (aggregated for stats)
  • Display status (online/offline)
  • Loop assignments

API → Advertiser:
  • Advertisement confirmation (201)
  • Statistics/analytics reports
  • Loop deployment confirmation

Operator → API:
  • POST /displays (create display)
  • PUT /displays/:id/config (update config)
  • GET /displays/:id/status (check heartbeat)
  • GET /displays (list all)

Display Device → API:
  • POST /displays/:id/ping (heartbeat, no auth)
  • POST /analytics/record-view (view event)
  • POST /analytics/record-click (click event)

API → Display Device:
  • Loop content (advertisements to display)
  • Configuration updates (brightness, volume)
  • Current status/commands
```

### Data Store Details

**users Collection**
```
{
  _id: ObjectId,
  email: "advertiser@example.com" (indexed, unique),
  passwordHash: "bcrypt hash",
  firstName: "John",
  lastName: "Doe",
  role: "ADVERTISER",
  status: "ACTIVE",
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**advertisements Collection**
```
{
  _id: ObjectId,
  adName: "Summer Sale",
  mediaUrl: "https://...",
  mediaType: "IMAGE",
  duration: 30,
  status: "ACTIVE" (indexed),
  views: 1250,
  clicks: 87,
  advertiserId: ObjectId (indexed, references users),
  createdAt: Date (indexed),
  updatedAt: Date,
  deletedAt: null
}
```

**displays Collection**
```
{
  _id: ObjectId,
  displayId: "DISPLAY_001",
  location: "Main Hall" (indexed),
  layout: "LANDSCAPE",
  resolution: { width: 1920, height: 1080 },
  configuration: { brightness: 100, volume: 50, ... },
  serialNumber: "SN123..." (indexed, unique),
  status: "ONLINE" (indexed),
  lastPing: Date,
  connectionToken: "token...",
  currentLoopId: ObjectId (nullable),
  createdAt: Date,
  deletedAt: null
}
```

**analytics_events Collection**
```
{
  _id: ObjectId,
  type: "VIEW", (indexed)
  advertisementId: ObjectId (indexed, references advertisements),
  displayId: ObjectId (indexed, references displays),
  timestamp: Date (indexed, TTL: 90 days),
  metadata: { duration: 30, ... }
}
```

**system_logs Collection**
```
{
  _id: ObjectId,
  type: "USER_ACTION",
  action: "Advertisement Created",
  userId: ObjectId (indexed, nullable),
  resourceType: "Advertisement",
  resourceId: ObjectId,
  changes: { before: {}, after: {} },
  status: "SUCCESS",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/...",
  timestamp: Date (indexed, TTL: 30 days)
}
```

---

## Diagram 11: Deployment Architecture

### Purpose
Shows how the application is deployed, scaled, and served to users.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN (CloudFlare/AWS)                    │
│  • Cache static files (images, JS bundles)                 │
│  • DDoS protection                                          │
│  • Geographic distribution                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer (NGINX/HAProxy)                  │
│  • Distribute traffic across API servers                   │
│  • SSL/TLS termination                                     │
│  • Health checks                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┼───────────┐
           │           │           │
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ API Pod 1│ │ API Pod 2│ │ API Pod N│
    │(Node.js) │ │(Node.js) │ │(Node.js) │
    │Express   │ │Express   │ │Express   │
    │ + Code   │ │ + Code   │ │ + Code   │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         │ Connection │            │
         └─────┬──────┴────────┬───┘
               │               │
               ▼               ▼
       ┌──────────────────────────────┐
       │  Kubernetes Cluster (GKE/EKS)│
       │  • Horizontal Pod Autoscaling│
       │  • Service discovery         │
       │  • Rolling deployments       │
       │  • Self-healing              │
       └──────────┬───────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌──────────────┐  ┌──────────────┐
    │  Shared Redis│  │   MongoDB    │
    │  (Sessions)  │  │  (Primary)   │
    │  (Cache)     │  │              │
    └──────────────┘  ├──────────────┤
                      │ Replica Set  │
                      │  (Backups)   │
                      │  (Failover)  │
                      └──────────────┘

Development Environment:
localhost:5000 (Express)
        ↓
localhost:27017 (MongoDB Local)

Staging Environment:
api-staging.admirots.io
        ↓
MongoDB Atlas Staging Cluster
        ↓
Firebase Admin SDK (for Google OAuth)

Production Environment:
api.admirots.io (Load Balancer)
        ↓
3 API Pods (Kubernetes)
        ↓
MongoDB Atlas Production Cluster (Replicated)
        ↓
Redis Cluster (Sessions, Cache)
        ↓
CloudFlare CDN (Static Files)

CI/CD Pipeline:
┌─────────┐
│ Git Commit
└────┬────┘
     │
     ▼
┌──────────────┐
│GitHub Actions│
│ • Lint       │
│ • Test       │
│ • Build      │
└────┬─────────┘
     │
     ▼
┌──────────────────┐
│ Docker Registry  │
│ (Docker image)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Kubernetes       │
│ Update Pods      │
│ Rolling Restart  │
└──────────────────┘
```

### Environment Configuration

**.env.production**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pwd@cluster.mongodb.net/admirots
JWT_SECRET=complex-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
CORS_ORIGINS=https://admirots.io,https://app.admirots.io
LOG_LEVEL=warn
```

**.env.staging**
```
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://staging-user:pwd@staging-cluster.mongodb.net/admirots
JWT_SECRET=staging-secret-key
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
CORS_ORIGINS=https://staging.admirots.io,localhost:3000
LOG_LEVEL=info
```

---

## Diagram 12: Security Layers Diagram

### Purpose
Shows all security mechanisms protecting the system.

### ASCII Visualization

```
┌────────────────────────────────────────────────────┐
│           EXTERNAL ATTACKER                        │
└────────────────────┬───────────────────────────────┘
                     │ (malicious request)
                     ▼
    ┌─────────────────────────────────────┐
    │  Layer 1: NETWORK LEVEL             │
    ├─────────────────────────────────────┤
    │ • Firewall (AWS Security Groups)    │
    │ • Only ports 80, 443 open           │
    │ • DDoS protection (CloudFlare)      │
    │ • WAF (Web Application Firewall)    │
    │ • Rate limiting at CDN level        │
    ├─────────────────────────────────────┤
    │ Result: Malicious IPs blocked,      │
    │         DDoS traffic filtered       │
    └────────────────┬────────────────────┘
                     │ (gets through)
                     ▼
    ┌─────────────────────────────────────┐
    │  Layer 2: TRANSPORT LEVEL           │
    ├─────────────────────────────────────┤
    │ • HTTPS/TLS 1.3 only                │
    │ • Certificate validation            │
    │ • HSTS headers                      │
    │ • No HTTP (only HTTPS)              │
    │ • Cipher suite enforcement          │
    ├─────────────────────────────────────┤
    │ Result: Encrypted traffic,          │
    │         MITM attacks prevented      │
    └────────────────┬────────────────────┘
                     │ (gets through)
                     ▼
    ┌─────────────────────────────────────┐
    │  Layer 3: APPLICATION LEVEL         │
    ├─────────────────────────────────────┤
    │                                     │
    │ 3a. Input Validation                │
    │ • Zod schema validation             │
    │ • Field length limits               │
    │ • Type enforcement                  │
    │ • Enum/enum validation              │
    │ • URL validation                    │
    │                                     │
    │ 3b. NoSQL Injection Prevention      │
    │ • Whitelist sort fields             │
    │ • Parameterized queries             │
    │ • Input sanitization                │
    │                                     │
    │ 3c. Authentication (JWT)            │
    │ • Bearer token in header            │
    │ • Signature verification            │
    │ • Expiration check                  │
    │ • Refresh token rotation            │
    │                                     │
    │ 3d. Authorization (RBAC)            │
    │ • Role-based access control         │
    │ • Endpoint permission checks        │
    │ • Resource ownership verification   │
    │                                     │
    │ 3e. Rate Limiting                   │
    │ • 20 requests/minute per IP         │
    │ • 5 failed login attempts lockout   │
    │ • Exponential backoff               │
    │                                     │
    │ 3f. CORS Protection                 │
    │ • Whitelist allowed origins         │
    │ • Preflight request validation      │
    │ • Credentials handling              │
    │                                     │
    │ 3g. Error Handling                  │
    │ • No stack traces to client         │
    │ • Generic error messages            │
    │ • Detailed logging internally       │
    │                                     │
    │ 3h. Helmet.js Headers               │
    │ • X-Frame-Options (Clickjacking)    │
    │ • X-Content-Type-Options (MIME)     │
    │ • Content-Security-Policy           │
    │ • Strict-Transport-Security         │
    │                                     │
    ├─────────────────────────────────────┤
    │ Result: Injections blocked,         │
    │         Unauthorized access denied, │
    │         User data protected        │
    └────────────────┬────────────────────┘
                     │ (gets through)
                     ▼
    ┌─────────────────────────────────────┐
    │  Layer 4: DATA LEVEL                │
    ├─────────────────────────────────────┤
    │ • Password Hashing (bcrypt)         │
    │   - 10 salt rounds                  │
    │   - Never stored in plaintext       │
    │   - One-way encryption              │
    │                                     │
    │ • Field Encryption                  │
    │   - Sensitive fields encrypted      │
    │   - Keys in environment variables   │
    │                                     │
    │ • Database Access Control           │
    │   - MongoDB user roles              │
    │   - Database-level auth             │
    │   - IP whitelist to MongoDB         │
    │                                     │
    │ • Soft Deletes                      │
    │   - Data never fully deleted        │
    │   - Audit trail maintained          │
    │   - Recovery possible               │
    │                                     │
    ├─────────────────────────────────────┤
    │ Result: Data breaches have limited  │
    │         impact (hashed passwords),  │
    │         Audit trail preserved      │
    └────────────────┬────────────────────┘
                     │ (gets through)
                     ▼
    ┌─────────────────────────────────────┐
    │  Layer 5: MONITORING & LOGGING      │
    ├─────────────────────────────────────┤
    │ • System Logs (all actions)         │
    │ • Failed login attempts logged      │
    │ • Suspicious pattern detection      │
    │ • Real-time alerts                  │
    │ • Audit trail immutable             │
    │ • IP address logging                │
    │ • User agent logging                │
    │                                     │
    ├─────────────────────────────────────┤
    │ Result: Security incidents detected,│
    │         Forensics analysis possible │
    └─────────────────────────────────────┘

Security Best Practices Checklist:
✅ HTTPS/TLS enforced
✅ CORS whitelist configured
✅ Authentication required for sensitive endpoints
✅ Authorization checks on every protected endpoint
✅ Input validation with Zod on all endpoints
✅ Rate limiting active
✅ Passwords hashed with bcrypt
✅ JWT tokens with expiration
✅ No sensitive data in error messages
✅ No sensitive data in logs
✅ SQL/NoSQL injection prevention
✅ XSS protection (no eval, sanitized output)
✅ CSRF protection (SameSite cookies)
✅ Account lockout after failed attempts
✅ Audit logging for all changes
✅ Helmet.js security headers
✅ Regular security audits
✅ Dependency vulnerability scanning
✅ Secrets management (env variables)
✅ Database backup & recovery
```

### Sensitive Data Handling

```
Personally Identifiable Information (PII):
  • Email addresses - Hashed in logs, never in error messages
  • Passwords - Never logged, bcrypt hashed in storage
  • User profiles - Only returned to authenticated user or admin
  • IP addresses - Logged only for audit trail

Payment Information:
  • None stored (future: use Stripe/payment processor)

Access Tokens:
  • JWT tokens - Signed, expiring, never logged in full
  • Stored in client localStorage/sessionStorage (XSS vulnerable)
  • Sent in Authorization header only

Session Data:
  • Sessions stored in Redis with expiration
  • User ID in session, full data fetched as needed
  • Session tokens invalidated on logout
```

---

## Summary

This guide provides comprehensive specifications for 12 essential system design diagrams:

1. **Entity-Relationship Diagram** - Database structure
2. **Use Case Diagram** - Actor interactions
3. **Sequence Diagram (Auth)** - Registration & login flow
4. **Sequence Diagram (Ads)** - Advertisement creation & tracking
5. **Component Architecture** - System organization
6. **Class Diagram** - OOP structure
7. **Advertisement Lifecycle** - State transitions
8. **Display Lifecycle** - Device states
9. **API Gateway & Middleware** - Request flow
10. **Data Flow Diagram** - Data movement
11. **Deployment Architecture** - Production setup
12. **Security Layers** - Protection mechanisms

Each diagram includes:
- ASCII visualization for quick reference
- Detailed description of elements
- Relationships and interactions
- Creation tools and methods
- Best practices

Use these specifications alongside the Postman collection and codebase to build a complete understanding of AdMiroTS architecture.

