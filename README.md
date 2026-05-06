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

## Getting started locally

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or later) — [Download](https://www.postgresql.org/download/)

Verify installations:
```bash
node --version    # e.g., v18.0.0
npm --version     # e.g., 9.0.0
psql --version    # e.g., PostgreSQL 15.2
```

### Step 1: Set up PostgreSQL database

1. Start PostgreSQL (if not running automatically on your system).

2. Create the BG Hub database and user:
   ```bash
   psql -U postgres
   ```
   ```sql
   CREATE USER bg_hub WITH PASSWORD 'bg_hub_password';
   CREATE DATABASE bg_hub OWNER bg_hub;
   ```
   Exit psql with `\q`.

3. Verify the connection:
   ```bash
   psql -U bg_hub -d bg_hub -h localhost
   ```
   Exit with `\q` if successful.

### Step 2: Set up the backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Verify `.env` has these values (they should match `.env.example` defaults):
   ```
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=bg_hub
   DATABASE_PASSWORD=bg_hub_password
   DATABASE_NAME=bg_hub
   JWT_SECRET=dev_jwt_secret
   JWT_EXPIRES_IN=1h
   ```

5. Run database migrations:
   ```bash
   npm run migration:run
   ```
   You should see output confirming migrations completed successfully.

6. Start the backend server:
   ```bash
   npm run start:dev
   ```
   You should see:
   ```
   [Nest] 12345 - 05/06/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
   [Nest] 12345 - 05/06/2026, 10:00:00 AM     LOG [InstanceLoader] ... dependencies initialized
   [Nest] 12345 - 05/06/2026, 10:00:00 AM     LOG [NestFactory] Nest application successfully started
   ```

7. Verify the backend is running:
   ```bash
   curl http://localhost:3000/health
   ```
   (The app should respond, or you can check the API docs at Step 4 instead.)

### Step 3: Set up the frontend

1. In a **new terminal**, navigate to the project root (not the `backend/` folder):
   ```bash
   cd .. # if you're still in backend/
   pwd   # should show /Users/sfilizzola/Gitprojects/bg-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Verify `.env` has this value:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

5. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   You should see:
   ```
   VITE v[version] ready in [time] ms

   ➜  Local:   http://localhost:5173/
   ➜  press h + enter to show help
   ```

### Step 4: Verify everything works

1. **Frontend app**: Open [http://localhost:5173](http://localhost:5173) in your browser.
   - You should see the BG Hub login page.
   - Sign up with an email and password, then log in.

2. **API documentation**: Open [http://localhost:3000/docs](http://localhost:3000/docs) to view the interactive Scalar UI.
   - You can see all available endpoints and test them.

3. **OpenAPI spec (JSON)**: [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)

### Step 5: (Optional) Enable game providers

To search external game databases (e.g., BoardGameGeek), set these in `backend/.env`:

```
GAME_PROVIDERS_ENABLED=BGG
BGG_BASE_URL=https://boardgamegeek.com/xmlapi2
# BGG_API_TOKEN=your_token_here (if required)
```

Restart the backend server for changes to take effect.

### Stopping the servers

- **Frontend**: Press `Ctrl+C` in the frontend terminal.
- **Backend**: Press `Ctrl+C` in the backend terminal.
- **PostgreSQL**: Stop via your system settings or `brew services stop postgresql` (macOS).

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `Database connection error` | Verify PostgreSQL is running, and `DATABASE_*` values in `backend/.env` match your setup. Run `psql -U bg_hub -d bg_hub` to test. |
| `Port 3000 already in use` | Change `PORT` in `backend/.env` or kill the process: `lsof -i :3000` then `kill -9 <PID>`. |
| `Port 5173 already in use` | Change the port or kill the process using `lsof -i :5173`. |
| `Migration failed` | Ensure the database exists and is empty. Run `psql -U postgres -c "DROP DATABASE bg_hub; CREATE DATABASE bg_hub OWNER bg_hub;"` to reset. |
| `VITE_API_BASE_URL not found` | Ensure `.env` is in the project root (not `backend/.env`), and run `npm install` again. |
| `npm install fails` | Delete `node_modules` and `package-lock.json`, then re-run `npm install`. |

## MVP scope (current)

- **In:** Owned, Wishlist, PlayLog (free-text result), follow/followers, private profiles (approve follow to see full profile), feed (text, newest-first, load-more), tagged players as registered users only, game search with external provider fallback.
- **Out for MVP:** Likes/comments, blocking, notifications, guest players, manual game creation.

## License

Private / unlicensed unless stated otherwise.
