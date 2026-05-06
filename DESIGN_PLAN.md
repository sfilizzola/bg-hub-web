# BG Hub Design System Migration Plan

> A step-by-step guide to align the entire project with the design system.
> 
> **Status:** Phase 2 IN PROGRESS
> Last updated: 2026-05-06

---

## Problem Summary

The design system (`design-system/`) and MUI theme (`src/theme.ts`) exist but are **not fully adopted** across the codebase:

1. ❌ `src/components/bg/` directory doesn't exist — composites are undocumented in code
2. ❌ `PlaysPage.tsx` and `SignupPage.tsx` use raw HTML with zero MUI
3. ❌ `FeedPage.tsx` renders feed items inline instead of using a composite
4. ❌ Ad-hoc `fontSize`, wrong `Typography` variants, raw `style={{}}` bypasses throughout
5. ❌ Old components in `src/components/` will be replaced by new ones in `src/components/bg/`

---

## Phase 1: Create `src/components/bg/index.tsx`

**Goal:** Create all five BG Hub composites in one file.

### Step 1.1: Create the file
- [x] Create `/Users/sfilizzola/Gitprojects/bg-hub/src/components/bg/index.tsx`

### Step 1.2: Implement `<RatingStamp />`
- [x] Wax-seal medallion (circular gradient, amber/500 to amber/300)
- [x] Props: `score: number`, `size?: 56` (default), `showCap?: false`, `sx?: SxProps`
- [x] Render: `Typography variant="score"` + gradient `Box` background

### Step 1.3: Implement `<StatusChip />`
- [x] Thin MUI `<Chip>` wrapper
- [x] Props: `status: "owned" | "wishlist" | "played" | "new"`, `count?: number`
- [x] Colors: owned=emerald/secondary, wishlist=rust/error, played=ink/amber text, new=ink/ink.60

### Step 1.4: Implement `<GameCard />`
- [x] Trading-card tile per design spec
- [x] Props (all optional except `title`):
  - [x] `title: string` (required)
  - [x] `year?: number | null`
  - [x] `score?: number | null`
  - [x] `players?: string` (e.g. "1–4")
  - [x] `playTime?: number` (minutes)
  - [x] `bggRating?: number`
  - [x] `tags?: string[]`
  - [x] `status?: "none" | "owned" | "wishlist"` (default: "none")
  - [x] `imageUrl?: string | null`
  - [x] `onAddOwned?: () => void`
  - [x] `onAddWishlist?: () => void`
  - [x] `onLogPlay?: () => void`
  - [x] `onRemove?: () => void` (for Owned/Wishlist pages)
  - [x] `removing?: boolean`
  - [x] `loading?: boolean` (shows `<Skeleton>`)
  - [x] `sx?: SxProps`
- [x] Anatomy:
  - [x] Cover image (5:3 ratio) or striped placeholder
  - [x] Year tag (top-left, small typography)
  - [x] Status flag (top-right, if owned/wishlist)
  - [x] `<RatingStamp>` (overlapping body if score exists)
  - [x] Title: `variant="h3"`
  - [x] Meta line: `variant="mono"` (year · players · time · BGG rating)
  - [x] Tags: `<Chip>` list
  - [x] CTA row: 2–3 buttons

### Step 1.5: Implement `<FeedItem />`
- [x] Single feed event row
- [x] Props:
  - [x] `kind: "play" | "owned" | "wishlist" | "follow"` (required)
  - [x] `actor: { username, displayName?, imageUrl?, avatarColor?: [hex, hex] }` (required)
  - [x] `time: string` (pre-formatted, e.g. "2h ago") (required)
  - [x] `exactTime?: string` (tooltip, ISO)
  - [x] `withUsers?: string[]` (for plays: other tagged players)
  - [x] `game?: { title, sub?, score? }`
  - [x] `note?: string` (play notes)
  - [x] `onClickGame?: () => void`
  - [x] `onClickActor?: () => void`
  - [x] `sx?: SxProps`
- [x] Anatomy:
  - [x] Avatar (circular, gradient or image)
  - [x] Actor name (link)
  - [x] Verb + kind chip (e.g. "added to Owned")
  - [x] Time (tooltip for exact)
  - [x] Game title (link if onClickGame)
  - [x] Score stamp (if game.score)
  - [x] Additional players (if play kind)
  - [x] Note text (if exists)

### Step 1.6: Implement `<UserCard />`
- [x] Profile card
- [x] Props:
  - [x] `name: string` (required)
  - [x] `handle: string` (required)
  - [x] `pronouns?: string`
  - [x] `bio?: string`
  - [x] `avatarUrl?: string`
  - [x] `avatarColor?: [hex, hex]` (gradient fallback)
  - [x] `stats: { owned: number; wishlist: number; plays: number }` (required)
  - [x] `isFollowing?: boolean`
  - [x] `followsYou?: boolean`
  - [x] `onFollow?: () => void`
  - [x] `onView?: () => void`
  - [x] `sx?: SxProps`
- [x] Anatomy:
  - [x] Warm gradient banner (`surface.s3` base + accent)
  - [x] Avatar (circular, large)
  - [x] Name + handle + pronouns
  - [x] Bio (truncated)
  - [x] Stats grid: 3 cols (owned count + label, wishlist, plays)
  - [x] Follow button (outlined) + View button (text)
  - [x] Follow/followsYou badge if applicable

### Step 1.7: Export all composites
- [x] `export { RatingStamp, StatusChip, GameCard, FeedItem, UserCard };`

**Checklist for Phase 1 complete:**
- [x] File created and all 5 composites render without errors
- [x] No hardcoded hex colors (use `tokens.*` or `theme.palette.*`)
- [x] No raw `px` in `sx` (use `theme.spacing()` or unitless numbers)
- [x] No ad-hoc `fontSize`/`fontFamily` (use `Typography variant=` only)
- [x] TypeScript compilation passes with no errors

---

## Phase 2: Rewrite pages with raw HTML

### Step 2.1: Rewrite `src/pages/SignupPage.tsx`
- [x] Replace all raw HTML with MUI components
- [x] Mirror structure from `LoginPage.tsx`:
  - [x] `<Box sx={{ ... }}>` container (centered, full height)
  - [x] `<Paper sx={{ ... }}>` card
  - [x] `<Typography variant="h5">` heading ("Create account")
  - [x] `<TextField label="Email" ... />` email input
  - [x] `<TextField label="Username" ... />` username input
  - [x] `<TextField label="Password" type="password" ... />` password input
  - [x] `<Button variant="contained">` submit button
  - [x] "Already have an account?" link → `<Link component={RouterLink} to="/login">`
  - [x] Error alert (if any): `<Alert severity="error">`
- [x] Use MUI theme spacing for all padding/margin
- [x] Use MUI theme colors (no hardcoded hex)

### Step 2.2: Rewrite `src/pages/PlaysPage.tsx`
- [x] Replace all raw HTML with MUI
- [x] Structure:
  - [x] Page title: `<Typography variant="h1">`
  - [x] List of plays: `<Stack>` with `<Card>` components
  - [x] Each play row: `<Card>` with game title, date, players, notes
  - [x] Create form: `<Card>` with `<Stack component="form">`
  - [x] Buttons: `<Button variant="contained">` for create/submit, `color="error"` for delete
  - [x] Loading state: `<CircularProgress>`
  - [x] Empty state: `<Box>` with centered text
- [x] Use theme spacing and tokens throughout
- [x] No raw `style={{}}` objects

**Checklist for Phase 2 complete:**
- [x] SignupPage and PlaysPage use MUI exclusively
- [x] No raw HTML tags (`<div>`, `<h1>`, `<input>`, `<button>`)
- [x] All text in `<Typography variant=...>`
- [x] All colors from MUI theme
- [x] All spacing via MUI sx props

---

## Phase 3: Fix pages with design violations

### Step 3.1: Fix `src/pages/FeedPage.tsx`
- [ ] **Remove inline feed rendering:**
  - Delete `FeedItemContent` component entirely
  - Delete manual `<List>`, `<ListItem>`, `<ListItemAvatar>`, `<Avatar>`, `<Divider>` structure
  - Replace render loop with `<FeedItem>` from `components/bg`
- [ ] **Import:** `import { FeedItem } from "../components/bg";`
- [ ] **Map `FeedItemDto` → `<FeedItem>` props:**
  ```tsx
  <FeedItem
    kind={item.type === "PLAYLOG_CREATED" ? "play" : item.type === "ADDED_TO_COLLECTION" ? "owned" : "wishlist"}
    actor={{
      username: item.actor.username,
      displayName: item.actor.displayName,
      imageUrl: item.actor.imageUrl,
      // avatarColor: generated or fetched
    }}
    time={formatRelativeTime(item.createdAt)}
    exactTime={item.createdAt}
    game={item.game ? { title: item.game.name, score: /* if exists */ } : undefined}
    note={/* playlog notes if exists */}
  />
  ```
- [ ] **Remove all `style={{}}` bypasses:**
  - Remove `style={{ fontWeight: 600, color: "inherit" }}` from all `<Link>` tags (8 instances)
  - Use `<Link component={RouterLink} sx={{ fontWeight: 600 }}>`  instead
- [ ] **Remove bespoke sizing:**
  - Delete `sx={{ width: 36, height: 36 }}` on Avatar (let `<FeedItem>` size it)

### Step 3.2: Fix `src/pages/GameDetailsPage.tsx`
- [ ] **Replace `action.hover` with `surface.s3`** (2 occurrences):
  - Line 297: `bgcolor: "action.hover"` → `bgcolor: "surface.s3"`
  - Line 311: `bgcolor: "action.hover"` → `bgcolor: "surface.s3"`
- [ ] **Remove `fontFamily` override** (line 379):
  - Delete `sx={{ fontFamily: "inherit" }}` on `<Typography>`
- [ ] **Fix double border on Tabs:**
  - Remove wrapping `<Box sx={{ borderBottom: 1, borderColor: "divider" }}>` around `<Tabs>` (MuiTabs already adds border)
- [ ] **Remove redundant fontWeight** (line 334):
  - Remove `fontWeight={600}` from `<Typography variant="h2">` (theme already sets it)

### Step 3.3: Fix `src/components/Layout.tsx`
- [ ] Line 25: Change `fontSize: 28` on `<SportsEsports>` icon
  - Replace with: `sx={{ fontSize: "1.75rem" }}` or wrap in `<Box sx={{ fontSize: "inherit" }}>` container

### Step 3.4: Fix old `src/components/GameCard.tsx` (temporary)
> ⚠️ This will be deleted in Phase 5. Fix violations now in case other code references it.
- [ ] **Replace `variant="h6"` with `variant="h3"`** (lines 364, 392)
  - `h6` theme = uppercase label (too small)
  - `h3` theme = card title (correct size/weight)
- [ ] **Remove `fontSize="0.8125rem"`** from 3 `<Typography>` tags (lines 279, 410, 426)
  - These override `body2` which is already 13px (0.8125rem at default root)

**Checklist for Phase 3 complete:**
- [ ] FeedPage renders all feed items via `<FeedItem>` composite
- [ ] No raw `style={{}}` on `<Link>` tags
- [ ] GameDetailsPage uses `surface.s3`, no `action.hover`
- [ ] No double borders, redundant fontWeights, or fontFamily overrides
- [ ] Layout icon displays at correct size

---

## Phase 4: Update imports across pages

> Execute only after Phase 1 is complete (composites exist).

### Step 4.1: Update `src/pages/SearchPage.tsx`
- [ ] Remove: `import { GameCard } from "../components/GameCard";`
- [ ] Remove: `import { UserCard } from "../components/UserCard";`
- [ ] Add: `import { GameCard, UserCard } from "../components/bg";`
- [ ] **Map search results to GameCard props:**
  ```tsx
  // For game search results (GameSearchItemDto)
  <GameCard
    title={game.name}
    year={game.year}
    imageUrl={game.imageUrl}
    status={ownedIds.includes(game.id || game.bggId?.toString()) ? "owned" : wishlistIds.includes(...) ? "wishlist" : "none"}
    onAddOwned={() => handleAddOwned(game)}
    onAddWishlist={() => handleAddWishlist(game)}
  />
  ```
- [ ] UserCard render in search results: map `SearchUserDto` to `<UserCard>` props

### Step 4.2: Update `src/pages/OwnedPage.tsx`
- [ ] Remove: `import { GameCard } from "../components/GameCard";`
- [ ] Add: `import { GameCard } from "../components/bg";`
- [ ] **Map GameDto to GameCard:**
  ```tsx
  <GameCard
    title={game.name}
    year={game.year}
    imageUrl={game.imageUrl}
    players={game.minPlayers && game.maxPlayers ? `${game.minPlayers}–${game.maxPlayers}` : null}
    playTime={game.playTime}
    bggRating={/* if available */}
    score={/* if available */}
    tags={game.categories}
    status="owned"
    onLogPlay={() => handleLogPlay(game)}
    onRemove={() => handleRemove(game.id)}
    removing={removing === game.id}
  />
  ```

### Step 4.3: Update `src/pages/WishlistPage.tsx`
- [ ] Same as OwnedPage but `status="wishlist"`
- [ ] Remove: `import { GameCard } from "../components/GameCard";`
- [ ] Add: `import { GameCard } from "../components/bg";`

### Step 4.4: Update `src/pages/PublicProfilePage.tsx`
- [ ] Remove: `import { CompactGameCard } from "../components/CompactGameCard";`
- [ ] Add: `import { GameCard } from "../components/bg";`
- [ ] **Use GameCard with compact layout:**
  ```tsx
  <GameCard
    title={game.name}
    year={game.year}
    imageUrl={game.imageUrl}
    status="none"
    // Minimal props for compact display
  />
  ```
  (May need to add a `compact?: boolean` prop to GameCard if layout needs to differ significantly)

### Step 4.5: Update `src/pages/FollowersPage.tsx`
- [ ] Remove: `import { UserCard } from "../components/UserCard";`
- [ ] Add: `import { UserCard } from "../components/bg";`
- [ ] **Map user data to UserCard:**
  ```tsx
  <UserCard
    name={user.displayName || user.username}
    handle={user.username}
    avatarUrl={user.imageUrl}
    stats={{ owned: user.ownedCount, wishlist: user.wishlistCount, plays: user.playsCount }}
    isFollowing={user.isFollowing}
    followsYou={user.followsYou}
    onFollow={() => handleFollow(user.id)}
    onView={() => navigate(`/u/${user.username}`)}
  />
  ```

### Step 4.6: Update `src/pages/FollowingPage.tsx`
- [ ] Same as FollowersPage
- [ ] Remove: `import { UserCard } from "../components/UserCard";`
- [ ] Add: `import { UserCard } from "../components/bg";`

**Checklist for Phase 4 complete:**
- [ ] All pages import from `../components/bg` (not old locations)
- [ ] No import errors in any page
- [ ] Dev server runs without errors
- [ ] All pages render composites with correct prop mapping

---

## Phase 5: Cleanup (delete old components)

> Execute only after all imports are updated (Phase 4 complete) and you've verified no other files reference the old components.

### Step 5.1: Verify no lingering imports
- [ ] Grep for any remaining imports of old components:
  ```bash
  grep -r "from.*components/GameCard\|from.*components/UserCard\|from.*components/CompactGameCard" src/
  ```
  (Should return 0 results)

### Step 5.2: Delete old files
- [ ] Delete `/Users/sfilizzola/Gitprojects/bg-hub/src/components/GameCard.tsx`
- [ ] Delete `/Users/sfilizzola/Gitprojects/bg-hub/src/components/UserCard.tsx`
- [ ] Delete `/Users/sfilizzola/Gitprojects/bg-hub/src/components/CompactGameCard.tsx`

### Step 5.3: Final verification
- [ ] Dev server starts without errors
- [ ] All pages render correctly
- [ ] No console warnings about missing imports

**Checklist for Phase 5 complete:**
- [ ] Old components deleted
- [ ] All pages use `components/bg` composites
- [ ] No orphaned imports or references
- [ ] Full design system migration complete ✅

---

## Verification Checklist (full migration)

After all phases:

- [ ] `src/components/bg/index.tsx` exists with all 5 composites
- [ ] All composites use MUI + `tokens.*` only (no hardcoded hex, no raw px)
- [ ] `SignupPage.tsx` and `PlaysPage.tsx` rewritten in MUI
- [ ] `FeedPage.tsx` uses `<FeedItem>` composites
- [ ] All design violations fixed (no `action.hover`, no ad-hoc fontSize, etc.)
- [ ] All pages import from `components/bg` (not old locations)
- [ ] Old components deleted
- [ ] Dev server runs: `npm run dev`
- [ ] No TypeScript errors: `npm run check`
- [ ] No console warnings in browser

---

## Notes

- Each phase is independent; complete one before starting the next
- Refer back to `design-system/*.md` for implementation details
- If a composite doesn't match the spec exactly, update this file + the design-system docs
- Update the "Last updated" date at the top when you make progress
