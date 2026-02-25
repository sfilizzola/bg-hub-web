# BG Hub — Agent Rules

## Source of truth
- Follow `/docs/context.md` for product + tech decisions.
- If something is not defined there, make the smallest MVP-friendly choice and document it.

## MVP constraints (do not expand scope)
- Feed is text-only, newest-first, load-more pagination
- Feed events: Owned add, Wishlist add, PlayLog create
- Private profiles: follow requests must be approved; non-approved can only see basic profile + counts
- PlayLog results in MVP is free-text (not structured scoring)
- Tagged players in MVP must be registered users only
- No: likes/comments, blocking, notifications, guest players, manual game creation

## Tech constraints
- Backend: NestJS + PostgreSQL
- Auth MVP: email+password+JWT
- Frontend: web, left sidebar, profile lists as tabs

## External game API
- Search local DB first
- If not found, query external provider and persist locally (store `externalId` + `apiRef`)
- If external is unavailable/quota exceeded: local search only (graceful)

## URLs & naming
- Profile URLs MVP: `/u/:username` where username is unique
- Terms: Owned / Wishlist / Plays
- Entity: `PlayLog`

# Execution Plan

## Step 1 — Project Skeleton

Goal:
Create the base project structure according to constraints.

Requirements:
- NestJS backend project initialized
- PostgreSQL configured
- Basic health endpoint `/health`
- Environment configuration using `.env`
- No business logic yet

## Step 2 — Auth MVP (email + password + JWT)

Goal:
Users can sign up, log in, and access a protected endpoint.

Requirements:
- Create `User` entity/table with:
  - id (uuid)
  - email (unique)
  - username (unique, required for `/u/:username`)
  - passwordHash
  - createdAt, updatedAt
- Endpoints:
  - POST `/auth/signup` (email, username, password)
  - POST `/auth/login` (email, password) -> returns JWT
  - GET `/auth/me` (protected) -> returns user id/email/username
- Use bcrypt for hashing
- Use JWT via NestJS (passport-jwt is fine)
- Validate input (DTO + class-validator)
- Do not implement follow/profile/feed yet