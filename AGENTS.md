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

## Step 3 — Game Catalog + Search (Local DB + External Fallback)

Goal:
Implement a Game catalog in Postgres and a search endpoint that:
1) searches local DB first
2) if local results are empty, queries an external provider and persists results locally
3) if external fails, returns local-only results gracefully

Requirements:
- Create `Game` entity/table with at least:
  - id (uuid)
  - name
  - externalId
  - apiRef (string, e.g. "bgg")
  - imageUrl (nullable)
  - year (nullable int)
  - minPlayers, maxPlayers (nullable int)
  - playTime (nullable int)
  - complexityWeight (nullable float)
  - categories (text[] or json)
  - mechanics (text[] or json)
  - description (text, nullable)
  - createdAt, updatedAt
- Add unique constraint on (apiRef, externalId)
- Endpoints:
  - GET `/games/search?q=...`
    - returns array of Game DTOs
    - local DB query: ILIKE on name, limit 20
    - if local results empty:
      - call external provider search by name
      - persist mapped games locally
      - return persisted results
    - if external provider fails/quota:
      - return local results (empty ok) + flag `externalAvailable: false` in response
- External provider (MVP):
  - Implement a provider interface `GameProvider`
  - Implement a first provider using BoardGameGeek XML API2:
    - search endpoint (by query) then fetch details via `thing?stats=1`
    - parse XML into our fields as best-effort

## Step 4 — My Games (Owned + Wishlist)

Goal:
Authenticated users can mark games as Owned and/or Wishlist, and list them.

Requirements:
- Create join tables/entities:
  - UserOwnedGame (userId, gameId, createdAt)
  - UserWishlistGame (userId, gameId, createdAt)
  - unique constraint (userId, gameId) for each
- Endpoints (all protected):
  - POST `/me/owned/:gameId` (adds owned)
  - DELETE `/me/owned/:gameId` (removes owned)
  - GET `/me/owned` (list owned games)
  - POST `/me/wishlist/:gameId`
  - DELETE `/me/wishlist/:gameId`
  - GET `/me/wishlist`
- Validate `gameId` exists, return 404 if not.
- Return Game DTOs in list endpoints.
- Add migrations.

## Step 5 — Play Logs (MVP)

Goal:
Authenticated users can record plays of a game and list them.

Requirements:
- Create `PlayLog` entity/table:
  - id (uuid)
  - userId (fk)
  - gameId (fk)
  - playedAt (timestamp, required)
  - durationMinutes (int, nullable)
  - playersCount (int, nullable)
  - notes (text, nullable)
  - createdAt, updatedAt
- Endpoints (all protected):
  - POST `/me/plays` body: { gameId, playedAt, durationMinutes?, playersCount?, notes? }
  - GET `/me/plays` (list latest first, limit 50)
  - DELETE `/me/plays/:id`
- Validation:
  - gameId must exist
  - playedAt must be valid ISO date-time
  - durationMinutes and playersCount must be positive if provided
- Response:
  - POST returns created play log + embedded Game DTO
  - GET returns array of play logs with embedded Game DTO

Add migration for the table and indexes (userId, playedAt).