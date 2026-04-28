# AdMiro — Frontend Migration Log
**Date:** 2026-04-28  
**Session:** JS Frontend → Typed Monorepo (`apps/web`)  
**Scope:** Full migration + API consistency fixes

---

## What We Started With

### Old Frontend (`admiro/AdMiroFrontend`)
- Next.js 16, plain JS (.js/.jsx), no TypeScript
- Zustand store (untyped), axios with manual interceptors
- Icons: phosphor-react (not in global stack preferences)
- Toasts: sonner
- Animations: GSAP
- Pages: login (combined login+register), auth-callback, dashboard, display, display-login, display-register
- Components: DashboardLayout, DisplayForm, PageTransition, ScrollToTop, ToastProvider, ThemeProvider
- No shared types — manual API shape guessing

### Monorepo (`admiroTS`) State at Start
- `apps/api` — Express 5, TypeScript, full service/repo/controller pattern, JWT auth, bcrypt, Google OAuth, mongoose
- `apps/web` — Next.js 16 skeleton, all TEMP.TXT placeholders, nothing implemented
- `packages/domain` — Full domain entities (User, Advertisement, Display, DisplayLoop, Analytics, SystemLog, DisplayConnectionRequest), enums, interfaces, value objects
- `packages/shared` — Full DTOs for all modules (auth, displays, advertisements, analytics, display-loops, profile, system-logs, connection-requests)

---

## API Gaps Found

| Gap | Location | Fix |
|---|---|---|
| Auth response returns `{ message, user, token }` | `auth.controller.ts` | Updated to `{ success: true, data: { user, accessToken } }` |
| Login only accepts `email` but frontend sends `usernameOrEmail` | `auth.controller.ts` + `UserRepository.ts` | Added `findByUsernameOrEmail`, updated controller |
| Register doesn't handle `firstName`, `lastName`, `confirmPassword` | `auth.controller.ts` | Added field handling + password confirmation |
| `POST /api/displays/register-self` missing | `displays.*` | Added display self-registration endpoint |
| `GET /api/displays/by-token/:token` missing | `displays.*` | Added lookup by connection token |
| `POST /api/displays/report-status` missing | `displays.*` | Added display heartbeat/status reporting |
| `DisplayRepository` no `findByConnectionToken` | `DisplayRepository.ts` | Added method |
| `UserRepository` no `findByUsernameOrEmail` | `UserRepository.ts` | Added method |

---

## Frontend Migration Decisions

| Decision | Reason |
|---|---|
| `phosphor-react` → `lucide-react` | Global stack preference, same icon set quality |
| `zustand` store typed with `@admiro/shared` DTOs | Single source of truth — no type duplication |
| Access token stored in Zustand memory + localStorage fallback | Security improvement over pure localStorage |
| Feature-based folder structure in `src/features/` | Mirrors API module structure for easier navigation |
| Axios client in `src/lib/api/client.ts` | Token injection + 401 refresh retry in one place |
| Per-module API files (`auth.api.ts`, `displays.api.ts`, etc.) | Clean separation, typed with shared DTOs |
| Route groups `(auth)` and `(display)` | Isolate auth layout from display layout from dashboard |
| `ThemeProvider` dropped | Just a `document.documentElement.classList.remove('dark')` call — moved to layout body class |
| Theme tokens kept as `src/lib/theme.ts` | Reference for custom values used in Tailwind config |

---

## File Map

### Backend Changes
- `apps/api/src/modules/auth/auth.controller.ts` — fixed response shape + usernameOrEmail + firstName/lastName
- `apps/api/src/modules/displays/displays.controller.ts` — added registerSelf, getByConnectionToken, reportStatus
- `apps/api/src/modules/displays/displays.service.ts` — added registerSelf, getByConnectionToken, updateDisplayStatus
- `apps/api/src/modules/displays/displays.routes.ts` — wired 3 new endpoints
- `apps/api/src/services/repositories/UserRepository.ts` — added findByUsernameOrEmail
- `apps/api/src/services/repositories/DisplayRepository.ts` — added findByConnectionToken

### Frontend New Files (`apps/web/src/`)
- `app/layout.tsx` — root layout with providers
- `app/page.tsx` — redirects to /dashboard or /login
- `app/(auth)/login/page.tsx` — login+register combined
- `app/auth-callback/page.tsx` — Google OAuth callback handler
- `app/dashboard/page.tsx` — main dashboard with stats
- `app/(display)/display/page.tsx` — fullscreen display player
- `app/(display)/display-login/page.tsx` — display device login
- `app/(display)/display-register/page.tsx` — display device self-registration
- `components/DashboardLayout.tsx` — sidebar + header layout
- `components/DisplayForm.tsx` — display creation form
- `components/PageTransition.tsx` — GSAP page transition wrapper
- `components/ScrollToTop.tsx` — scroll-to-top button
- `components/ToastProvider.tsx` — sonner toast setup
- `features/auth/store/authStore.ts` — typed Zustand auth store
- `lib/api/client.ts` — axios instance with token interceptors
- `lib/api/auth.api.ts` — auth module API calls
- `lib/api/displays.api.ts` — displays module API calls
- `lib/api/advertisements.api.ts` — ads module API calls
- `lib/api/analytics.api.ts` — analytics module API calls
- `lib/utils.ts` — cn, formatDate, debounce helpers
- `lib/theme.ts` — design tokens (primary: #8b6f47, background: #faf9f7)
- `constants/routes.ts` — page and API route constants
- `hooks/useAnimations.ts` — GSAP animation hooks

### Frontend Updated Files
- `package.json` — added gsap, zustand, sonner, axios, lucide-react
- `next.config.ts` — webpack flag + image domains
- `globals.css` — Tailwind v4 + CSS custom properties from theme

---

## Known Remaining Work

- Analytics module in `apps/api` is scaffolded but not implemented (TEMP.TXT)
- Display-loops module in `apps/api` is scaffolded but not implemented (TEMP.TXT)
- Dashboard sub-pages (displays, ads, loops, analytics, profile) are not yet built — only the main dashboard page
- Connection requests management page not yet built
- File upload for ad media — not in scope for this session (needs storage solution decision)

---

## Commands

```bash
# Run everything
cd admiroTS && npm run dev

# Web only
npm run dev -w @admiro/web

# API only
npm run dev -w @admiro/api

# Typecheck
npm run typecheck
```
