# BG Hub — Agent Rules

## Source of truth
- Follow `/docs/context.md` for product + tech decisions.
- **Follow `/design-system/README.md` and the docs it points to for ALL visual decisions.** Read `design-system/tokens.md` and `design-system/components.md` before changing any visual code.
- If something is not defined there, make the smallest MVP-friendly choice and document it.

## Design system rules (non-negotiable)
- Use MUI components for layout and primitives — never raw HTML/CSS for layout structure.
- Pull colors from `theme.palette.*` or `tokens.*` (from `src/theme.ts`). **No hardcoded hex values.**
- Pull spacing from `theme.spacing(n)` — base is 4px. **No raw `px` for margin/padding.**
- Use `<Typography variant="…">` for all text. **Don't set `fontFamily` or `fontSize` ad hoc.**
- Reuse the composites in `src/components/bg/`: `<GameCard>`, `<FeedItem>`, `<RatingStamp>`, `<UserCard>`, `<StatusChip>`. Don't rebuild them.
- Dark mode only. Cozy tabletop palette: amber primary, emerald secondary, rust for danger/wishlist heat. Don't introduce new accent hues.
- Fonts: Bricolage Grotesque (display), Public Sans (UI), JetBrains Mono (numeric). Don't use Inter/Roboto/Arial/system fonts.
- If a new visual pattern recurs 3+ times, lift it into `src/components/bg/` and document it in `design-system/components.md`.

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
- Frontend: web, left sidebar (`<Drawer variant="permanent">`), profile lists as tabs

## External game API
- Search local DB first
- If not found, query external provider and persist locally (store `externalId` + `apiRef`)
- If external is unavailable/quota exceeded: local search only (graceful)

## URLs & naming
- Profile URLs MVP: `/u/:username` where username is unique
- Terms: Owned / Wishlist / Plays
- Entity: `PlayLog`
