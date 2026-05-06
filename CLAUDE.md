# BG Hub — Project Instructions

This file is read at the start of every Claude session in this project.

## Always do these first
1. Read `/design-system/README.md` before any visual or UI work.
2. Read `/docs/contaxt.md` for product scope and MVP boundaries.
3. Read `/AGENTS.md` for the rules you must follow.

## Visual work — non-negotiables
The design system in `/design-system/` is the source of truth. Specifically:

- `design-system/README.md` — overview + cheat sheet
- `design-system/tokens.md` — colors, type, spacing, radii, shadows
- `design-system/components.md` — primitives + composites
- `design-system/usage.md` — recipes & patterns
- `design-system/preview.html` — canonical visual reference (open in browser)

Implementation:
- `src/theme.ts` — MUI theme + exported `tokens`
- `src/components/bg/index.tsx` — `<GameCard>`, `<FeedItem>`, `<RatingStamp>`, `<UserCard>`, `<StatusChip>`

### Rules
- **MUI only** for layout (`Box`, `Stack`, `Card`, `Button`, `TextField`, `Dialog`, `Drawer`, `Tabs`, …).
- **Tokens only** for color (`theme.palette.*`, `tokens.*`). Never hardcode hex.
- **Theme spacing** for padding/margin (`theme.spacing(n)`, 4px base). Never raw `px`.
- **Typography variants** for text. Never set `fontFamily`/`fontSize` ad hoc.
- **Reuse composites** (`<GameCard>`, `<FeedItem>`, …) — don't rebuild them.
- **Dark mode only.** Aesthetic: cozy tabletop, warm dark, amber lantern + emerald felt + rust heat.
- Fonts: Bricolage Grotesque (display), Public Sans (UI), JetBrains Mono (numeric).
- If a new visual pattern recurs 3+ times, lift it into `src/components/bg/` and update `design-system/components.md`.

## Product scope (MVP)
See `/docs/contaxt.md`. Key constraints:
- Owned / Wishlist / Plays (PlayLog entity)
- Follow + private profiles (approval flow)
- Text-only feed, newest-first, load-more
- No likes/comments/blocking/notifications/guest players in MVP

## Tech
- Frontend: React + Vite + TypeScript + MUI
- Backend: NestJS + PostgreSQL + TypeORM
- Auth: email+password+JWT (OAuth later)

## When in doubt
- For visuals → `/design-system/`
- For product → `/docs/contaxt.md`
- For rules → `/AGENTS.md`
- If unclear, ask before guessing.
