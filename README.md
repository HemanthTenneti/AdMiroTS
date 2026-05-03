# AdMiroTS

A full-stack TypeScript SaaS platform for managing digital advertisements across distributed display networks in real time.

## Overview

AdMiroTS is built for organizations that need to create, schedule, distribute, and monitor digital advertisements across multiple screens, kiosks, and signage devices.

The system provides:

- centralized advertisement management
- display device registration and control
- playlist (display loop) orchestration
- real-time playback synchronization
- analytics and engagement tracking
- complete activity logging for auditability
- role-based access control for multi-user operations

This repository contains the monorepo architecture for the full production system with strict TypeScript modeling, domain-driven structure, and shared contracts between frontend and backend.

## What AdMiro Achieves

AdMiro solves end-to-end digital signage operations:

1. Content teams upload image/video ads with metadata and lifecycle status.
2. Operations teams register and manage display devices with health/status tracking.
3. Campaign managers build loops (playlists), control ordering/rotation, and assign loops to displays.
4. Display clients fetch assigned content, play ads, and report status/events.
5. The platform tracks impressions, interactions, and uptime metrics for analytics.
6. Every critical action is recorded in an immutable activity log for compliance and debugging.

## Core Capabilities

- Authentication with JWT and refresh token flow
- Google OAuth sign-in support
- Role-based authorization (Admin, Advertiser)
- Advertisement CRUD with media validation and status lifecycle
- Display management with connection token flow
- Loop creation with sequential/random rotation and layout strategy
- Display heartbeat and refresh polling workflow
- Analytics across displays, loops, and advertisements
- Audit trail with filtering by action, entity, user, and date range

## High-Level Architecture

```text
Browser / Display Client
            |
            v
Next.js Frontend (apps/web)
            |
            v
Express API (apps/api)
   - Auth + RBAC
   - Domain Controllers/Services
   - Validation + Middleware
   - Logging + Analytics
            |
            v
MongoDB (7 primary collections)
```

## Monorepo Structure

```text
.
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── config/               # env + app configuration
│   │       ├── middleware/           # auth, error, upload, rate limit, etc.
│   │       ├── modules/              # domain modules
│   │       │   ├── auth/
│   │       │   ├── advertisements/
│   │       │   ├── displays/
│   │       │   ├── display-loops/
│   │       │   ├── analytics/
│   │       │   ├── system-logs/
│   │       │   └── profile/
│   │       ├── types/                # API-only TypeScript types
│   │       ├── app.ts                # express composition
│   │       └── index.ts              # server bootstrap
│   └── web/
│       └── src/
│           ├── app/                  # Next.js App Router pages
│           ├── features/             # feature-first UI domain code
│           ├── components/           # reusable UI pieces
│           ├── context/              # auth/session state management
│           └── lib/                  # API client, utilities, constants
├── packages/
│   └── shared/
│       └── src/                      # shared contracts, enums, interfaces
└── docs/
      ├── PROJECT_DESCRIPTION.md
      └── MONOREPO_WORKFLOW_STRUCTURE.md
```

## Domain Model (Classes and Interfaces)

The backend is organized around strongly typed domain entities.

Primary entities:

- User
- Advertisement
- Display
- DisplayLoop
- SystemLog
- Analytics
- DisplayConnectionRequest

Typical interface shape:

```ts
export interface Advertisement {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  duration: number;
  status: "active" | "scheduled" | "paused" | "expired" | "draft";
  createdAt: string;
  updatedAt: string;
}
```

```ts
export interface DisplayLoop {
  id: string;
  loopId: string;
  displayId: string;
  loopName: string;
  rotationType: "sequential" | "random" | "weighted";
  displayLayout: "fullscreen" | "masonry";
  advertisements: Array<{ adId: string; loopOrder: number }>;
  totalDuration: number;
}
```

Service layer classes follow explicit responsibilities:

- AuthService: token issuance, refresh, credential/OAuth auth
- AdvertisementService: ad lifecycle and media constraints
- DisplayService: registration, status, assignment, refresh triggers
- DisplayLoopService: ordering, rotation, duration calculation
- AnalyticsService: aggregation and query APIs
- LoggingService: audit creation and retrieval

This separation keeps controllers thin, services testable, and repository/data access isolated.

## API Design

The platform exposes REST APIs grouped by domain:

- /api/auth
- /api/advertisements
- /api/displays
- /api/display-loops
- /api/system-logs
- /api/profile
- /api/analytics

Design principles:

- consistent success/error response envelopes
- pagination and filtering for list endpoints
- ownership checks for advertiser-scoped resources
- admin-only gates for privileged actions
- strict input validation and typed request DTOs

## Repository Pattern

The data access layer follows the Repository Pattern to provide a consistent interface for interacting with MongoDB collections. The `BaseRepository` class encapsulates common CRUD operations, pagination, and filtering logic that all concrete repositories inherit. Concrete repositories—including `AdvertisementRepository`, `DisplayRepository`, and `UserRepository`—extend this base to add domain-specific queries, custom mappings, and business logic tailored to their entities. This approach centralizes data access concerns, improves testability through dependency injection, and enforces a clear separation of concerns between domain logic and data persistence.

## Frontend Design

Frontend uses Next.js App Router with feature-first organization:

- authenticated dashboard area for management workflows
- public display playback and display authentication pages
- domain-driven UI slices for Ads, Displays, Loops, Logs, Analytics, Profile
- centralized API client and typed contracts
- predictable state management for auth and session context

## Security and Reliability

- Helmet and CORS hardening
- Rate limiting for general and auth-sensitive routes
- JWT verification middleware and role checks
- File upload constraints (size/type) and Cloudflare R2 signed URLs
- Global error handling with normalized error payloads
- Structured logging for traceability and operations

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Run all workspaces

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type-check

```bash
npm run typecheck
```

### API Tests (Mocha + Chai)

```bash
npm run test -w @admiro/api
```

## Deployment Notes

- Deploy `apps/web` as a Vercel Next.js project.
- Deploy `apps/api` as a separate Vercel project using [`apps/api/vercel.json`](apps/api/vercel.json).
- Configure API env vars:
  - `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGINS`
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`
- Configure web env var:
  - `NEXT_PUBLIC_API_BASE_URL` pointing to the deployed API URL.

## Example End-to-End Flow

1. Admin signs in and registers displays.
2. Advertiser uploads media and creates advertisements.
3. Advertiser creates display loops and assigns ads.
4. Admin assigns a loop to a target display.
5. Display client fetches loop content and starts playback.
6. Client reports heartbeat + play metrics.
7. Dashboard visualizes analytics and logs in near real time.

## Use Cases

- Retail promotions across store networks
- Transportation hub ad scheduling
- Corporate internal signage
- Campus communication systems
- Multi-location campaign rollout with centralized control
