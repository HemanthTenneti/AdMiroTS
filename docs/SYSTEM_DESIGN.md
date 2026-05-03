# AdMiro System Design

**Version:** 1.0  
**Date:** 2026-05-03  
**Scope:** Full-stack ad management platform — backend API, frontend dashboard, display device client

---

## 1. Architecture Overview

AdMiro is a monorepo with two independently deployable applications and two shared packages:

```
test/
├── backend/                  # Express + TypeScript API (@admiro/api)
│   ├── src/
│   └── packages/
│       ├── domain/           # Domain entity classes and enums (@admiro/domain)
│       └── shared/           # Shared response types (@admiro/shared)
├── frontend/                 # Next.js 15 + TypeScript dashboard (@admiro/web)
│   └── src/
│       └── lib/contracts/    # Frontend-side contract layer (DTOs, schemas, types)
├── package.json              # Root workspace orchestrator
└── tsconfig.base.json        # Shared TypeScript config
```

The backend serves a REST API on port 8000. The frontend is a Next.js App Router application on port 3000. There is no server-side rendering of API data — all data fetching is client-side via axios. The two applications communicate exclusively through the HTTP contract defined in `frontend/src/lib/contracts/`.

**Tech stack:**

| Layer | Technology |
|---|---|
| Backend runtime | Node.js + Express 5 + TypeScript |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (jsonwebtoken) + bcrypt + Google OAuth (google-auth-library) |
| Media storage | Cloudflare R2 (AWS SDK S3-compatible) |
| Frontend framework | Next.js 15, App Router, TypeScript |
| Frontend state | Zustand |
| HTTP client | Axios |
| Validation (both) | Zod |
| Styling | Tailwind CSS + Shadcn/ui |

---

## 2. Backend Architecture

### 2.1 Layer Architecture

The backend follows a strict four-layer architecture. Each layer has a single responsibility and depends only on the layer directly below it.

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Controller    │  Parses HTTP request, calls service, formats HTTP response
│  (*.controller) │  No business logic. No direct DB access.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  Business logic, orchestration, error throwing
│  (*.service)    │  No HTTP concerns. No direct DB queries.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  Database access only (Mongoose queries)
│  (*Repository)  │  No business logic. Returns domain entity instances.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Domain Layer   │  Entity classes with business methods (User, Advertisement, etc.)
│ (@admiro/domain)│  Lives in backend/packages/domain/
└─────────────────┘
```

The layer chain for each module is as follows:

| Module | Controller | Service | Repository | Domain Entity |
|---|---|---|---|---|
| auth | `auth.controller.ts` | `auth.service.ts` | `UserRepository` | `User` |
| advertisements | `advertisements.controller.ts` | `advertisements.service.ts` | `AdvertisementRepository` | `Advertisement` |
| displays | `displays.controller.ts` | `displays.service.ts` | `DisplayRepository` | `Display` |
| display-loops | `display-loops.controller.ts` | `display-loops.service.ts` | `DisplayLoopRepository` | `DisplayLoop` |
| analytics | `analytics.controller.ts` | `analytics.service.ts` | `AnalyticsRepository` | `Analytics` |
| profile | `profile.controller.ts` | `profile.service.ts` | `UserRepository` | `User` |
| system-logs | `system-logs.controller.ts` | `system-logs.service.ts` | `SystemLogRepository` | `SystemLog` |

### 2.2 Module Structure

Every backend module under `backend/src/modules/` follows an identical file structure:

```
modules/<name>/
├── <name>.controller.ts    # HTTP handling only — reads req, calls service, writes res
├── <name>.service.ts       # Business logic only — no HTTP, no Mongoose queries
├── <name>.routes.ts        # Express Router wiring — mounts middleware + controller methods
├── <name>.types.ts         # Module-specific TypeScript interfaces and types
└── <name>.validation.ts    # Zod schemas for request body/query validation
```

The `auth` module is the only exception — it has no `auth.types.ts` or `auth.validation.ts` because validation is performed inline in the controller and type definitions live in `backend/src/types/auth.types.ts` (shared across middleware).

Routes are created via factory functions that accept `jwtSecret` (and `googleClientId` for auth) and close over them, enabling dependency injection without a DI container:

```typescript
// backend/src/app.ts
app.use("/api/auth", authRateLimiter,
  createAuthRoutes(env.JWT_SECRET, env.GOOGLE_CLIENT_ID, env.JWT_EXPIRES_IN));
app.use("/api/advertisements", createAdvertisementRoutes(env.JWT_SECRET));
```

### 2.3 Design Patterns

#### Repository Pattern

**Intent:** Abstract all database operations behind a typed interface so the service layer never touches Mongoose directly.

**Base class:** `backend/src/services/base/BaseRepository.ts`

```typescript
export abstract class BaseRepository<T = Record<string, any>> {
  constructor(protected model: Model<any>) {}

  async findById(id: string): Promise<T | null>
  async findOne(filter: Record<string, any>): Promise<T | null>
  async find(filter: Record<string, any>): Promise<T[]>
  async findWithPagination(filter, page, limit, sortBy, sortOrder): Promise<{ data: T[]; total: number }>
  async create(data: Record<string, any>): Promise<T>
  async updateById(id: string, data: Record<string, any>): Promise<T | null>
  async deleteById(id: string): Promise<T | null>
  async count(filter: Record<string, any>): Promise<number>
}
```

The `findWithPagination` method executes the query and `countDocuments` in parallel with `Promise.all`, avoiding two sequential round-trips.

**Note on `findById`:** The base method queries `{ id }` (the application-level string ID), not MongoDB's `_id`. All entities use an `IdGenerator`-assigned string ID as the primary business identifier.

**Seven concrete repositories extend `BaseRepository`:**

| Repository | File | Domain-specific methods added |
|---|---|---|
| `UserRepository` | `repositories/UserRepository.ts` | `findByEmail`, `findByGoogleId`, `findByUsername`, `findByUsernameOrEmail`, `findActive`, `update` |
| `AdvertisementRepository` | `repositories/AdvertisementRepository.ts` | `findByAdvertiserId`, `findByStatus`, `findActive`, `incrementViews`, `incrementClicks`, `findByAnyIds` |
| `DisplayRepository` | `repositories/DisplayRepository.ts` | `findByLocation`, `findByStatus`, `findByLayout`, `updateLastPing`, `findByDisplayId`, `findByConnectionToken`, `findByDisplayIds` |
| `AnalyticsRepository` | `repositories/AnalyticsRepository.ts` | `findByDisplayId`, `findByAdvertisementId`, `findByLoopId`, `updateEngagementMetrics` |
| `DisplayLoopRepository` | `repositories/DisplayLoopRepository.ts` | `findByName`, `findWithDisplays`, `addAdvertisement`, `removeAdvertisement`, `findByDisplayId` |
| `DisplayConnectionRequestRepository` | `repositories/DisplayConnectionRequestRepository.ts` | `findByStatus`, `findBySerialNumber`, `findPending`, `findByRequestId`, `findByDisplayId` |
| `SystemLogRepository` | `repositories/SystemLogRepository.ts` | `findByAction`, `findByUserId`, `findByEntity`, `findByDateRange` |

Each concrete repository maps its Mongoose document to a domain entity class instance using `new EntityClass(doc.toObject() as IEntity)`. This ensures the service layer always receives typed domain objects, not raw Mongoose documents.

#### Strategy Pattern (Pluggable Storage)

**Intent:** Allow the media storage backend to be swapped without changing service call sites.

**File:** `backend/src/services/storage/R2StorageService.ts`

At construction time, `R2StorageService` calls `isR2Configured(env)` — defined in `backend/src/config/env.ts` — which checks for the presence of all four required R2 environment variables (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`). If any are absent, `this.client` is set to `null` and `this.enabled` is `false`.

```typescript
// backend/src/services/storage/R2StorageService.ts
constructor() {
  this.enabled = isR2Configured(this.env);
  this.client = this.enabled
    ? new S3Client({ region: "auto", endpoint: `https://${this.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, ... })
    : null;
}
```

When `createUploadUrl` is called, `ensureEnabled()` throws a `ValidationError` immediately if R2 is not configured, returning a 400 before any cloud call is attempted. The `AdvertisementService` calls `this.storageService.createUploadUrl(input)` without any awareness of whether R2 is the underlying provider — the strategy is entirely encapsulated. A future swap to AWS S3 or local disk storage would only require a new class implementing the same `createUploadUrl` interface.

**Upload constraints enforced by the service:**

| Media type | Allowed MIME types | Max file size |
|---|---|---|
| image | jpeg, png, webp, gif | 10 MB |
| video | mp4, webm, quicktime | 250 MB |

#### Error Hierarchy (Open/Closed Principle)

**Intent:** Define a typed error hierarchy so a single error-handler middleware normalizes all application errors without needing `switch` statements or type checks per error code.

**Base class:** `backend/src/utils/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details: Record<string, string> | undefined = undefined
  ) { ... }
}
```

**Six concrete subclasses:**

| Class | File | HTTP Status | Code |
|---|---|---|---|
| `ValidationError` | `errors/ValidationError.ts` | 400 | `VALIDATION_ERROR` |
| `UnauthorizedError` | `errors/UnauthorizedError.ts` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | `errors/ForbiddenError.ts` | 403 | `FORBIDDEN` |
| `NotFoundError` | `errors/NotFoundError.ts` | 404 | `NOT_FOUND` |
| `ConflictError` | `errors/ConflictError.ts` | 409 | `CONFLICT` |
| `InternalError` | `errors/InternalError.ts` | 500 | `INTERNAL_ERROR` |

`ValidationError` accepts an optional `details: Record<string, string>` map for field-level error reporting (populated from Zod issue paths).

The error handler in `backend/src/middleware/error-handler.middleware.ts` uses a single `instanceof AppError` check. Any `AppError` subclass passes that check and is normalized to the `ErrorResponse` envelope `{ success: false, error: { code, message, details } }`. Unrecognized errors (non-`AppError`) return a generic 500, and their `error.message` is suppressed in production to prevent information leakage.

#### Middleware Chain (Chain of Responsibility)

**Intent:** Decompose cross-cutting concerns into single-responsibility middleware, each passing control to the next link.

Middleware is applied in the following order, as wired in `backend/src/app.ts`:

```
Incoming Request
       │
       ▼
1. responseFormatter     ← Extends res with res.sendSuccess<T>()
       │                   backend/src/middleware/response-formatter.middleware.ts
       ▼
2. generalRateLimiter    ← 5000 req/min global limit (express-rate-limit)
       │                   backend/src/middleware/rate-limit.middleware.ts
       ▼
3. authRateLimiter       ← 1000 req/min on /api/auth/* only
       │                   backend/src/middleware/rate-limit.middleware.ts
       ▼
4. JWTAuthMiddleware     ← Verifies Bearer token, attaches req.user
       │                   backend/src/middleware/auth.middleware.ts
       ▼
5. validateRequest /     ← Zod schema parse of req.body or req.query
   validateQuery         ← Throws ValidationError on failure
       │                   backend/src/middleware/validation.middleware.ts
       ▼
6. Controller method     ← Business logic delegation
       │
       ▼
7. errorHandler          ← Catches all thrown errors, formats ErrorResponse
                           backend/src/middleware/error-handler.middleware.ts
```

`JWTAuthMiddleware` exposes two variants:
- `authenticate()` — hard-fails with 401 if token is absent or invalid. Used on protected routes.
- `optionalAuthenticate()` — silently skips if token is absent or malformed, proceeds as anonymous. Used on endpoints that should auto-scope to the logged-in user but must remain accessible to display device clients.

Three rate limiters are defined:
- `authRateLimiter` — 1,000 req/min, applied only to `/api/auth/*`
- `generalRateLimiter` — 5,000 req/min, applied globally
- `publicDataRateLimiter` — 2,000 req/min, for public listing endpoints

All rate limiters skip enforcement when `NODE_ENV === "test"`.

### 2.4 SOLID Principles in the Backend

**Single Responsibility Principle**

Each file has exactly one reason to change:

- `auth.controller.ts` — only changes if the HTTP interface (request shape, status codes) changes
- `auth.service.ts` — only changes if authentication business rules change
- `UserRepository.ts` — only changes if the User database schema or query strategy changes
- `AppError.ts` and its subclasses — each subclass changes only if that error's HTTP semantics change

**Open/Closed Principle**

- `BaseRepository` is open for extension (new repositories extend it without modifying the base) and closed for modification (existing CRUD methods are never touched when adding a new domain)
- New error types are added by subclassing `AppError`, not by modifying `error-handler.middleware.ts`
- New API modules are added by creating a new module folder and mounting a new route in `app.ts` without touching existing modules

**Liskov Substitution Principle**

- All six `AppError` subclasses are substitutable for `AppError` in the error handler. The `instanceof AppError` check works correctly for all of them due to `Object.setPrototypeOf` in each constructor, which is necessary to maintain the prototype chain across TypeScript transpilation boundaries.
- All seven repositories are substitutable for `BaseRepository<T>` — any service that holds a `BaseRepository<T>` reference could receive any concrete repository.

**Interface Segregation Principle**

Module-specific type files (`advertisements.types.ts`, `displays.types.ts`) keep interfaces narrow and scoped. No single giant interface file is shared across modules. Each module's service and controller import only the types they require.

**Dependency Inversion Principle**

- Controllers depend on service classes, not on repositories or Mongoose directly
- Services depend on repository classes, not on Mongoose models directly
- `app.ts` injects `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `JWT_EXPIRES_IN` into route factories, keeping secrets out of service constructors and making the injection point explicit

---

## 3. Frontend Architecture

### 3.1 App Structure

The frontend uses Next.js 15 App Router. Routes are organized into four groups:

```
frontend/src/app/
├── page.tsx                          # Landing page (public)
├── layout.tsx                        # Root layout
├── (auth)/
│   └── login/page.tsx                # Login page (unauthenticated)
├── (display)/
│   ├── display-login/page.tsx        # Display device login
│   ├── display-register/page.tsx     # Display device registration
│   └── display/page.tsx              # Display playback view
├── auth-callback/page.tsx            # OAuth redirect handler
└── dashboard/
    ├── layout.tsx                    # Dashboard layout with nav
    ├── page.tsx                      # Dashboard home
    ├── ads/                          # Advertisement CRUD (list, new, [id], [id]/edit)
    ├── displays/                     # Display management + nested loops
    ├── analytics/page.tsx
    ├── connection-requests/page.tsx
    ├── loops/page.tsx
    ├── logs/page.tsx
    └── profile/page.tsx
```

The `(auth)` and `(display)` route groups use parenthesized folder names to create layout groupings without affecting URL paths. The `dashboard/` segment is a standard layout-wrapped subtree — `dashboard/layout.tsx` wraps all authenticated routes.

### 3.2 Design Patterns

#### Adapter / Facade Pattern (API Layer)

**Intent:** Isolate all HTTP/axios concerns behind a set of domain-specific facades so components never interact with axios directly.

**Base client:** `frontend/src/lib/api/client.ts`

```typescript
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
});
```

Two interceptors are registered on the base client:

1. **Request interceptor** — reads `localStorage.getItem("accessToken")` on every outgoing request and attaches `Authorization: Bearer <token>` to the header. This runs client-side only (`typeof window !== "undefined"` guard).

2. **Response interceptor** — on any 401 response, clears `accessToken` and `user` from `localStorage` and redirects to `/login`. This provides automatic session expiry handling without requiring any per-component error handling.

**Seven domain API facades** wrap the base client:

| File | Domain | Key operations |
|---|---|---|
| `lib/api/auth.api.ts` | Authentication | login, register, google, me, refresh, logout |
| `lib/api/advertisements.api.ts` | Advertisements | CRUD, upload-url, activate, deactivate, stats |
| `lib/api/displays.api.ts` | Displays | CRUD, pairing, status, config, last-ping |
| `lib/api/display-loops.api.ts` | Display loops | CRUD, ad management, assignment |
| `lib/api/analytics.api.ts` | Analytics | overview, advertisement stats, display stats, timeline |
| `lib/api/profile.api.ts` | User profile | get, update, avatar, change-password |
| `lib/api/system-logs.api.ts` | System logs | list, filter, export |

Each facade method validates both the outgoing payload and the incoming response against Zod schemas from `lib/contracts/schemas/`. If the backend returns an unexpected shape, the parse throws immediately at the boundary rather than allowing malformed data to propagate into the component tree.

Example from `auth.api.ts`:
```typescript
login: async (payload: LoginPayload) => {
  const parsedPayload = LoginPayloadSchema.parse(payload);           // Validate outbound
  const response = await client.post("/api/auth/login", parsedPayload);
  const parsedResponse = LoginResponseSchema.parse(response.data);   // Validate inbound
  return { ...response, data: parsedResponse };
},
```

#### Shared Kernel / Contracts Layer

**Intent:** Provide a single source of truth for all types shared between the API and the UI, eliminating drift between what the backend sends and what the frontend expects.

**Location:** `frontend/src/lib/contracts/`

The contracts layer is organized into four namespaces:

```
lib/contracts/
├── domain/
│   └── enums/          # AdStatus, DisplayStatus, MediaType, UserRole, etc.
├── dtos/               # Per-operation request/response shapes
│   ├── advertisements/ # create.ts, update.ts, list.ts, details.ts, bulk.ts
│   ├── auth/           # login.ts, register.ts, google.ts, tokens.ts
│   ├── displays/       # create.ts, update.ts, list.ts, details.ts, config.ts, status.ts, assignment.ts
│   ├── display-loops/  # create.ts, update.ts, list.ts, details.ts, management.ts
│   ├── analytics/      # overview.ts, advertisement.ts, display.ts, engagement.ts, timeline.ts
│   ├── profile/        # profile-get.ts, profile-update.ts, avatar.ts, password.ts
│   ├── system-logs/    # log-entry.ts, export.ts
│   └── common/         # pagination.ts, response.ts, timestamps.ts
├── schemas/            # Zod schemas (one file per domain, mirrors dtos/)
├── types/              # TypeScript types inferred from schemas
└── index.ts            # Barrel export
```

The `SuccessEnvelopeSchema` factory in `schemas/common.ts` produces the standard success wrapper used across all response schemas:

```typescript
export const SuccessEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ success: z.literal(true), data: dataSchema });
```

This mirrors the backend's `SuccessResponse<T>` type from `@admiro/shared`, ensuring both sides agree on the response envelope structure.

Any change to a backend endpoint shape must be reflected in the corresponding contracts file before the frontend API facade will pass validation.

#### Feature Slice Pattern (Zustand Stores)

**Intent:** Scope client state to the feature that owns it, avoiding a global monolithic store.

Two Zustand stores exist:

**`frontend/src/features/auth/store/authStore.ts`**

Manages authentication state with four actions:

| Action | Effect |
|---|---|
| `setAuth(user, token)` | Persists to localStorage, sets Zustand state |
| `setUser(user)` | Updates user data without changing token |
| `logout()` | Clears localStorage and resets state |
| `hydrate()` | Reads localStorage on app boot, restores session |

The `hydrate()` method is the bridge between localStorage persistence and in-memory Zustand state. It must be called once on app initialization (typically in the root layout or a client component) before protected routes attempt to read `isAuthenticated`.

**`frontend/src/features/theme/store/themeStore.ts`**

Manages dark/light theme with `localStorage` persistence under the key `admiro-theme`. Applies the active theme by toggling `document.documentElement.classList` between `"dark"` and `"light"`.

#### Composition Pattern (Landing Page and Dashboard)

**Intent:** Build pages from independently testable, independently animated component primitives.

The landing page (`frontend/src/app/page.tsx`) is composed from seven components in `frontend/src/components/landing/`:

```
<Navbar />       — Navigation and auth CTA
<Hero />         — Above-the-fold headline section
<TrustBar />     — Social proof / brand logos
<Features />     — Feature highlights grid
<HowItWorks />   — Step-by-step flow explanation
<CTA />          — Bottom call-to-action
<Footer />       — Links and legal
```

Each component is self-contained with its own animation logic (GSAP). No component reads state from another. The dashboard is composed via `dashboard/layout.tsx`, which wraps all dashboard routes with the authenticated navigation shell.

### 3.3 SOLID Principles in the Frontend

**Single Responsibility Principle**

- Each `*.api.ts` file handles one domain's HTTP operations and nothing else
- Each landing component renders one page section and nothing else
- `authStore.ts` manages only authentication state; `themeStore.ts` manages only theme state
- `client.ts` handles only the base axios instance and cross-cutting interceptors

**Open/Closed Principle**

- New API domains are added as new `*.api.ts` files without modifying `client.ts`
- New contract DTOs are added as new files within the domain folder (`advertisements/bulk.ts` was added alongside `create.ts` without modifying existing DTO files)

**Liskov Substitution Principle**

All API modules follow the same call/response contract — they all use the shared `client`, all validate with Zod schemas from `lib/contracts/schemas/`, and all return `{ ...response, data: parsedResponse }`. A consumer can treat them interchangeably at the pattern level.

**Interface Segregation Principle**

DTOs are split by operation rather than by domain object. `advertisements/create.ts`, `advertisements/update.ts`, `advertisements/list.ts`, and `advertisements/details.ts` are separate files. A component creating a new advertisement imports only `CreateAdvertisementDto` — it has no dependency on the `ListAdvertisementsDto` shape.

**Dependency Inversion Principle**

- Components depend on `lib/api/*.api.ts` abstractions, not on axios directly
- Pages depend on the Zustand `useAuthStore` interface, not on `localStorage` directly
- The Zustand store's `hydrate()` action abstracts the localStorage read/parse/fallback logic away from any component

---

## 4. Cross-Cutting Concerns

### 4.1 Shared Contracts (Frontend to Backend)

`frontend/src/lib/contracts/` is the interface contract between the two applications. It mirrors the types defined in `backend/packages/domain/` and `backend/packages/shared/`, but exists independently in the frontend to avoid build-time coupling between the two deployable units.

The domain enums in `frontend/src/lib/contracts/domain/enums/` (10 enum files) must remain in sync with the corresponding enums in `backend/packages/domain/src/enums/` (9 enum files). Any backend change to an enum value is a breaking change that must be updated in the contracts layer before the frontend facade's Zod parse will pass.

### 4.2 Environment Configuration

Backend environment variables are validated at startup via a Zod schema in `backend/src/config/env.ts`. If any required variable is missing, the process throws a `ValidationError` with field-level details before accepting any connections.

**Required at all times:**

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing key |
| `GOOGLE_CLIENT_ID` | Google OAuth audience verification |

**Required only when R2 is enabled:**

| Variable | Purpose |
|---|---|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | Target bucket |
| `R2_PUBLIC_BASE_URL` | Optional CDN prefix for public URLs |

If the four required R2 variables are absent, `isR2Configured()` returns `false`, `R2StorageService.client` is `null`, and any call to `createUploadUrl` returns a 400 `ValidationError`. The rest of the API continues operating normally.

**Frontend environment variables:**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID for GSI |

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` must equal `GOOGLE_CLIENT_ID` on the backend. If they differ, Google token verification will fail with an audience mismatch error, which the `AuthController.googleAuth` method detects and surfaces as a descriptive 401 message.

### 4.3 Error Handling Strategy

**Backend:**

All business errors are thrown as `AppError` subclasses from the service layer. The single `errorHandler` middleware at the end of the Express chain catches them all and normalizes to:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Advertisement with ID abc123 not found",
    "details": undefined
  }
}
```

`ValidationError` additionally includes a `details` map:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "email": "Invalid email", "password": "String must contain at least 6 character(s)" }
  }
}
```

Unrecognized errors (non-`AppError`) return a generic 500 in production. The raw `error.message` is only included in development to prevent information leakage.

**Frontend:**

The axios response interceptor in `client.ts` handles the 401 case globally (clear storage, redirect to `/login`). For all other errors, API facades propagate the rejected promise. Components catch errors via try/catch or React error boundaries and surface `error.response?.data?.error?.message` to the user.

### 4.4 Authentication Flow (Email/Password)

```
1. User submits login form
         │
         ▼
2. authApi.login(payload)
   ├── LoginPayloadSchema.parse(payload)         ← Zod validates outbound
   └── POST /api/auth/login
         │
         ▼
3. AuthController.login()
   ├── Resolves username → email if needed
   └── authService.login(email, password)
         │
         ▼
4. AuthService.login()
   ├── userRepository.findByEmail(email)
   ├── Checks account lock (isLocked, lockedUntil)
   ├── bcrypt.compare(password, user.password)  ← Constant-time verification
   ├── Records failed attempts (exponential backoff: 5min, 10min... max 60min)
   ├── Locks account after 5 failed attempts
   └── On success: resets failedLoginAttempts, calls user.updateLastLogin()
         │
         ▼
5. Returns { user, accessToken }
         │
         ▼
6. LoginResponseSchema.parse(response.data)     ← Zod validates inbound
         │
         ▼
7. authStore.setAuth(user, token)
   ├── localStorage.setItem("accessToken", token)
   ├── localStorage.setItem("user", JSON.stringify(user))
   └── Zustand state: isAuthenticated = true
         │
         ▼
8. All subsequent requests: client.ts request interceptor
   └── config.headers.Authorization = `Bearer ${token}`
```

**Account lockout behavior:** After 5 consecutive failed login attempts, the account is locked for `min(failedAttempts * 5, 60)` minutes. The generic error message "Invalid email or password" is returned for all failure cases (user not found, wrong password, inactive, locked) to prevent enumeration attacks.

### 4.5 Google OAuth Flow

```
1. Frontend: Google Sign-In (GSI) prompts One Tap
         │  NEXT_PUBLIC_GOOGLE_CLIENT_ID identifies the app
         ▼
2. GSI returns credential (Google ID token)
         │
         ▼
3. authApi.google(credential)
   └── POST /api/auth/google  { token: credential }
         │
         ▼
4. AuthController.googleAuth()
   ├── googleClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
   └── Extracts: payload.sub (googleId), payload.email, payload.name, payload.picture
         │
         ▼
5. AuthService.googleAuth(googleId, email, name, picture)
   ├── Find by googleId → existing Google user
   ├── Find by email → existing email user (link Google ID to account)
   └── Create new user if neither found (isNewUser = true)
         │
         ▼
6. Returns { user, accessToken, isNewUser }
         │
         ▼
7. Frontend: same as step 7 of email/password flow
```

**Requirement:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend, used by GSI to mint the token) must equal `GOOGLE_CLIENT_ID` (backend, used as the `audience` parameter in `verifyIdToken`). A mismatch produces an audience error. The `AuthController` detects this by checking for keywords like "wrong recipient", "audience", or "invalid token signature" in the error message and returns a descriptive 401 that includes a diagnostic hint.

### 4.6 Media Upload Flow (Cloudflare R2)

The upload path bypasses the backend entirely after the presigned URL is issued. The backend never handles the file bytes.

```
1. User selects file in advertisement form
         │
         ▼
2. Frontend: advertisementsApi.getUploadUrl({ advertiserId, mediaType, mimeType, fileName, fileSize })
   └── POST /api/advertisements/upload-url
         │
         ▼
3. AdvertisementService.createUploadUrl(input)
   └── R2StorageService.createUploadUrl(input)
       ├── ensureEnabled()                          ← Throws 400 if R2 not configured
       ├── validateUploadInput()                    ← MIME type + file size checks
       ├── Generates: objectKey = advertisements/{advertiserId}/{uuid}.{ext}
       ├── PutObjectCommand with ContentType + ContentLength
       └── getSignedUrl(client, command, { expiresIn: R2_UPLOAD_URL_TTL_SECONDS })
         │
         ▼
4. Returns { objectKey, uploadUrl, publicUrl, expiresIn }
         │
         ▼
5. Frontend: PUT file bytes directly to uploadUrl (Cloudflare R2)
   └── No backend proxy — bandwidth goes direct to R2
         │
         ▼
6. Frontend: saves publicUrl to advertisement record
   └── POST /api/advertisements  { mediaUrl: publicUrl, mediaObjectKey: objectKey, ... }
```

The `publicUrl` is constructed from `R2_PUBLIC_BASE_URL` (a CDN or custom domain prefix) if set, otherwise falls back to the R2 bucket endpoint directly.

### 4.7 Domain Entity Layer

The `@admiro/domain` package (`backend/packages/domain/`) contains the core business objects. Entities are plain TypeScript classes — not Mongoose documents — with business methods encapsulated on them. This separates persistence concerns from domain logic.

**Eight entity classes:**

| Entity | File | Key business methods |
|---|---|---|
| `User` | `entities/User.ts` | `getFullName()`, `isAdmin()`, `isAdvertiser()`, `isGoogleAuth()`, `updateLastLogin()`, `deactivate()`, `activate()`, `updateProfile()`, `toSafeObject()` |
| `Advertisement` | `entities/Advertisement.ts` | Status management, view/click counters |
| `Display` | `entities/Display.ts` | Pairing, status transitions |
| `DisplayLoop` | `entities/DisplayLoop.ts` | Advertisement sequence management |
| `DisplayConnectionRequest` | `entities/DisplayConnectionRequest.ts` | Approval/rejection workflow |
| `Analytics` | `entities/Analytics.ts` | Metric aggregation |
| `SystemLog` | `entities/SystemLog.ts` | Audit trail entries |

The `User.toSafeObject()` method strips the `password` field before any entity is serialized into an API response, preventing credential leakage at the domain layer rather than relying on per-controller serialization logic.

**Nine domain enums** (`AdStatus`, `ConnectionRequestStatus`, `DisplayLayout`, `DisplayStatus`, `EntityType`, `LogAction`, `MediaType`, `Orientation`, `RotationType`) are defined in `backend/packages/domain/src/enums/` and mirrored in `frontend/src/lib/contracts/domain/enums/`.

---

## 5. API Surface Summary

All endpoints are prefixed with `/api`. The full endpoint reference is documented in `test/AdMiro_API.postman_collection.json`.

| Prefix | Module | Auth required |
|---|---|---|
| `/api/auth` | Authentication | Mixed (public for login/register/google) |
| `/api/profile` | User profile | Yes |
| `/api/advertisements` | Advertisement management | Mixed (optional for listings) |
| `/api/displays` | Display management | Mixed (optional for display clients) |
| `/api/display-loops` | Loop management | Yes |
| `/api/analytics` | Analytics data | Yes |
| `/api/system-logs` | Audit logs | Yes |
| `/api/health` | Health check | No |
| `/api/workflow` | Module listing | No |

---

## 6. Known Design Notes and Trade-offs

1. **`BaseRepository` uses `Model<any>`** — The base class deliberately types the Mongoose model as `Model<any>` to avoid conflicts between Mongoose's `Document` type and the domain entity classes. Type safety is enforced at the service layer by the generic `T` parameter. A future refactor would introduce separate `IUserDocument` interfaces extending `Document` to close this gap.

2. **`AuthController` directly accesses `this.authService.userRepository`** — The login method uses `(this.authService as any).userRepository` to resolve a username to an email before calling `authService.login()`. This is a minor violation of encapsulation. The correct fix is to add a `resolveUsernameToEmail(usernameOrEmail: string)` method to `AuthService`.

3. **JWT logout is client-side only** — `AuthController.logout` returns 200 without server-side token invalidation. Tokens remain valid server-side until expiry. A token blacklist or short-lived access tokens with refresh rotation would address this for higher-security deployments. The token pair (`generateTokenPair`) infrastructure is present in `AuthService` but not yet wired to the login flow.

4. **Rate limits are lenient** — Current limits (1,000/min auth, 5,000/min general) are set for development and Postman testing. Production deployment requires tuning these values down significantly.

5. **`AdvertisementService.bulkCreateAdvertisements` uses a sequential loop** — Advertisements are created one at a time via `for...of`. This will be slow for large batches. A `Promise.all` with `repository.insertMany` would be more appropriate.

6. **`advertisements/findByAnyIds` queries both `id` and `adId`** — The Advertisement entity has both an `id` field and an `adId` field with the same value (set in `AdvertisementService.createAdvertisement`). The dual-field query is a compatibility shim. Consolidating to a single ID field would simplify this.
