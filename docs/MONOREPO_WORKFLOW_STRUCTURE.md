# AdMiro Monorepo Workflow Structure

This repository intentionally starts with a light structure to avoid overwhelming developers.

## Runtime Apps

- `frontend`: Next.js 16 frontend (App Router)
- `backend`: Express 5 backend with TypeScript

## Backend Internal Packages

- `backend/packages/domain`: domain entities/enums/interfaces
- `backend/packages/shared`: backend DTOs/types/schemas

## Frontend Contracts

- `frontend/src/lib/contracts`: frontend-local contracts copied from shared definitions for standalone deployability

## Backend Workflow Modules

Backend modules are represented as folders first; implementation will be added incrementally:

- `auth`
- `advertisements`
- `displays`
- `display-loops`
- `analytics`
- `system-logs`
- `profile`

## Guiding Rule

Keep route/controller/service/repository additions inside their module folder to preserve a clear domain workflow as the app grows to 50+ endpoints.
