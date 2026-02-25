# BG Hub

A web app for tracking your board game collection, wishlist, and play history—and seeing what friends own, want, and play.

## Summary

**BG Hub** lets you:

- **Owned** — Record which games you own.
- **Wishlist** — Track games you want.
- **Plays** — Log play sessions (free-text results in MVP) and optionally tag other registered users.
- **Profiles** — Public profile at `/u/:username` with lists and counts; private profiles require approved follow requests.
- **Discovery** — Search games (local DB first, then external providers like BoardGameGeek); add games to owned/wishlist and create play logs from search.

The app uses a **left sidebar** for navigation (Search, Owned, Wishlist, Plays, Following, Followers) and **profile lists as tabs** on user pages. The MVP feed is text-only, newest-first, with load-more pagination; feed events are: Owned add, Wishlist add, and PlayLog create.

## Why this project

The goal is a single place to manage your board game library and see what others in your circle own, want, and play—without the noise of likes, comments, or manual game entry in the first version. By focusing on **owned / wishlist / plays** and **following** with optional privacy, the MVP stays scoped while still being useful for personal tracking and light social discovery.

## Tech stack

| Layer    | Choice                |
| -------- | --------------------- |
| Backend  | NestJS, PostgreSQL, TypeORM |
| Auth     | Email + password, JWT |
| Frontend | React, Vite, TypeScript |
| UI       | MUI (Material UI)     |
| API docs | OpenAPI + Scalar UI   |

External game data: search hits the local DB first; if a game isn’t found, the backend can query an external provider (e.g. BGG), persist it with `externalId` and `apiRef`, and return it. If the provider is down or over quota, search falls back to local-only.

## Project structure

- **Root** — Frontend (React + Vite + MUI). Run with `npm run dev` (default: http://localhost:5173).
- **`backend/`** — NestJS API. Run with `npm run start:dev` (default: http://localhost:3000). See `backend/README.md` for OpenAPI/Scalar docs and env.

## Getting started

### Backend

1. From `backend/` copy `.env.example` to `.env` and set `DATABASE_*` and `JWT_SECRET`.
2. Run migrations: `npm run migration:run` (from `backend/`).
3. Start API: `npm run start:dev`.

### Frontend

1. From project root copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (e.g. `http://localhost:3000`).
2. Install and run: `npm install && npm run dev`.

### Optional: game providers

To enable BoardGameGeek (BGG) when local search has no match, set in `backend/.env`:

- `GAME_PROVIDERS_ENABLED` (e.g. `BGG` if you add that provider key).
- `BGG_BASE_URL` and `BGG_BEARER_TOKEN` if required by the BGG integration.

See `backend/.env.example` for the full list.

## MVP scope (current)

- **In:** Owned, Wishlist, PlayLog (free-text result), follow/followers, private profiles (approve follow to see full profile), feed (text, newest-first, load-more), tagged players as registered users only, game search with external provider fallback.
- **Out for MVP:** Likes/comments, blocking, notifications, guest players, manual game creation.

## License

Private / unlicensed unless stated otherwise.
