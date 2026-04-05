# AdMiro Monorepo Workflow Structure

This repository intentionally starts with a light structure to avoid overwhelming developers.

## Runtime Apps

- `apps/web`: Next.js 16 frontend (App Router)
- `apps/api`: Express 5 backend with TypeScript

## Shared Package

- `packages/shared`: shared types and workflow constants

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
