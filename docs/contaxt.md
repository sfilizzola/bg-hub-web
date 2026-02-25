# BG Hub — Project Context (Single Source of Truth)

## 1) Product Overview
BG Hub is a community platform for boardgamers to:
- Track games they **own** (Owned list)
- Track games they **want** (Wishlist)
- Track games they **played** (Plays via PlayLogs)
- Follow other users and see their public activity and lists
- Centralize boardgame-related social + logging in one place

This is a **side project** but must be designed with **scalability** in mind.

## 2) Target Users
Primary users:
- Boardgame players and collectors
- People who want to browse others’ collections and log play habits

## 3) MVP Scope (What must exist in v1)
### Must-have user actions
- Sign up (email + password) and log in
- Add a game to **Owned**
- Follow other users
- View other users’ **Owned** and **Wishlist**
- Create/edit/delete a **PlayLog**
- View a simple feed (me + people I follow)

### MVP UX pages (web)
- Auth: Sign up / Log in
- Home Feed (simple)
- My Profile: Owned / Wishlist / Plays (tabs)
- User Profile: Owned / Wishlist / Plays (tabs)
- Search/Add Game (local DB + external fallback)
- Create/Edit PlayLog

### Navigation
- Web UI uses a **left sidebar**.

## 4) Domain Language
User-facing terms:
- Owned (owned games)
- Wishlist (wanted games)
- Plays (played games list)

Code entity for played sessions:
- `PlayLog`

User URLs:
- MVP uses `/u/:username`

Usernames:
- MVP requires a **unique handle** (e.g. `sam`) used in URLs.

## 5) Privacy & Following
We support both public and private accounts.

### Public accounts
- Following is **instant**

### Private accounts
- Follow requests become **pending** until accepted
- Only **approved followers** can see lists and activity

### Removing followers (MVP)
- Users can remove followers

### Blocking (MVP)
- Not in MVP

### What non-approved users see for private profiles
- username + avatar + bio + **counts** (e.g. number of owned games / wishlist / plays)
- Not the underlying list items

## 6) Feed (MVP)
### Feed scope
- Shows activity for: **me + people I follow**

### Feed items (MVP)
Feed should include:
- Added to **Owned**
- Added to **Wishlist**
- Created a **PlayLog**

### Feed presentation (MVP)
- **Text-only** list in MVP (simple, fast)
- Ordered newest-first
- Pagination via **Load more**

### Later (post-MVP)
- Compact cards with game cover images + richer layout
- Likes and comments (planned, not MVP)

## 7) Game Catalog Strategy (Local DB + External API)
Goal: minimize external API usage over time while preserving the ability to swap APIs.

### Rules
- When a game is not found locally, we query an **external games API**
- When we fetch a game externally, we **copy/store** it in the local DB
- Each game stored locally includes:
  - `externalId`
  - `apiRef` (which external provider was used)
- Over time, local DB grows, external queries decrease

### External API failure behavior (MVP)
If external quota fails:
- Search relies on **local DB only**
- UI should communicate that external search is unavailable (but do not block local search)

### MVP Game fields stored locally
Required:
- `name`
- `externalId`
- `apiRef`
- `imageUrl`
- `year`
- `minPlayers`, `maxPlayers`
- `playTime`
- `complexityWeight`
- `categories`, `mechanics`
- `description`

## 8) Lists & PlayLogs
### Owned / Wishlist (MVP)
- MVP supports presence in list (add/remove)
- No extra metadata required in MVP

Planned later metadata:
- condition, language, notes, acquired date, wishlist priority

### PlayLogs (MVP)
MVP fields:
- dateTime
- game (reference to local Game)
- tagged users (registered users only in MVP)
- results (MVP uses free-text field)
- notes (simple text input)

CRUD behavior:
- Create + Edit + Delete are in MVP

Planned later:
- guest players as free-text
- structured per-player scores + winner flag

## 9) Tech Stack (MVP)
- Frontend: BG Hub Web (primary client for now; mobile later)
- Backend: **Node.js + NestJS**
- Database: **PostgreSQL**
- Auth (MVP): **email + password + JWT**
- Auth (later): add OAuth (Google) while keeping email+password

MVP environment expectation:
- “Definition of done” = runs locally + seeded/demo data is acceptable
- Deployment is not required for MVP milestone

## 10) Non-goals (Explicitly out of MVP)
Do NOT implement in MVP unless explicitly asked:
- Blocking users
- Likes/comments on feed items
- Rich feed cards (images)
- Notifications
- Chat / DMs
- Game manual creation (fallback)
- Guest players in play logs
- Structured scoring per player
- Email verification and password reset
- Advanced privacy controls beyond public/private + follow approval
- Multi-client sync concerns (mobile offline, etc.)

## 11) Guardrails for Agents
When implementing features:
- Prefer simple, readable solutions over cleverness
- Keep the system modular to support swapping external game API providers
- Use a clear separation of concerns: controller/service/repo (NestJS style)
- Avoid adding new scope beyond MVP without explicit instruction