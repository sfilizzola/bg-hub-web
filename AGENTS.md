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
