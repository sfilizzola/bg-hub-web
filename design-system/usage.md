# Usage patterns

Worked examples for common BG Hub screens. Copy these as starting points; tweak the data.

---

## Page scaffold

Every page sits inside the persistent sidebar.

```tsx
import { Box, Drawer, AppBar, Toolbar, Typography } from "@mui/material";
import { Sidebar } from "@/components/Sidebar"; // your wrapper around <Drawer>

export function PageLayout({ children, title }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, px: 8, py: 7 }}>
        <Typography variant="eyebrow">Home</Typography>
        <Typography variant="display2" sx={{ mt: 1, mb: 7 }}>{title}</Typography>
        {children}
      </Box>
    </Box>
  );
}
```

---

## Home feed

```tsx
<PageLayout title="Around the table">
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 6 }}>
    <Stack spacing={3.5}>
      {feed.map(ev => (
        <FeedItem
          key={ev.id}
          kind={ev.kind}
          actor={ev.actor}
          time={ev.relativeTime}
          withUsers={ev.taggedUsers}
          game={ev.game}
          note={ev.note}
        />
      ))}
      <Button variant="outlined" fullWidth onClick={loadMore}>Load more</Button>
    </Stack>

    <Stack spacing={3.5}>
      <Card><CardContent><Typography variant="h4" color="ink.60">Your week</Typography>…</CardContent></Card>
    </Stack>
  </Box>
</PageLayout>
```

---

## Owned / Wishlist / Plays profile tabs

```tsx
<UserCard {...profile} />

<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 6, mb: 5 }}>
  <Tab label={`Owned · ${counts.owned}`} />
  <Tab label={`Wishlist · ${counts.wishlist}`} />
  <Tab label={`Plays · ${counts.plays}`} />
</Tabs>

<Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 4 }}>
  {games.map(g => (
    <GameCard
      key={g.id}
      title={g.name}
      year={g.year}
      score={g.score}
      players={`${g.minPlayers}–${g.maxPlayers}`}
      playTime={`${g.playTime}m`}
      tags={g.categories.slice(0, 2)}
      status={g.inOwned ? "owned" : g.inWishlist ? "wishlist" : "none"}
      onAddOwned={() => addToOwned(g.id)}
      onAddWishlist={() => addToWishlist(g.id)}
    />
  ))}
</Box>
```

---

## Search results (game search with external fallback)

```tsx
<TextField
  fullWidth
  placeholder="Try “Wingspan”…"
  InputProps={{ startAdornment: <SearchIcon /> }}
  value={q}
  onChange={e => setQ(e.target.value)}
/>

{externalUnavailable && (
  <Alert severity="warning" sx={{ mt: 3 }}>
    External game search is unavailable. Showing local results only.
  </Alert>
)}

<Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 4, mt: 4 }}>
  {results.map(g => <GameCard key={g.id} {...mapGame(g)} />)}
</Box>

{results.length === 0 && q && (
  <EmptyState title={`Nothing matches "${q}"`} action={<Button>Clear search</Button>} />
)}
```

---

## Log a play (Dialog)

```tsx
<Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
  <DialogTitle>Log a play</DialogTitle>
  <DialogContent>
    <Stack spacing={3.5}>
      <TextField label="Game" InputProps={{ startAdornment: <GameAvatar game={game} /> }} value={game.name} />
      <Stack direction="row" spacing={2}>
        <TextField label="Date & time" defaultValue="May 5, 2026 · 8:30pm" fullWidth />
        <TextField label="Length" defaultValue="142 min" fullWidth />
      </Stack>
      <TextField label="Players" /* chips picker */ />
      <TextField label="Result" defaultValue="Marta won by 4 points" fullWidth />
      <TextField label="Notes" multiline rows={2} />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button variant="text" onClick={close}>Cancel</Button>
    <Button variant="contained" onClick={save}>Save play</Button>
  </DialogActions>
</Dialog>
```

---

## Empty states

Always include: small motif illustration → headline (h4) → one-sentence body (body2 / `text.secondary`) → primary action.

```tsx
<Stack alignItems="center" spacing={1.5}
  sx={{ p: 7, border: "1px dashed", borderColor: "surface.edge", borderRadius: 3.5, textAlign: "center" }}>
  <MeepleSvg />
  <Typography variant="h4">Your shelf is empty</Typography>
  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
    Add the first game to your collection. We'll start building your stats from there.
  </Typography>
  <Button variant="contained" size="small">Find a game</Button>
</Stack>
```

---

## Accessibility checklist

- [ ] Color contrast ≥ 4.5:1 for body text (`ink.80` on `surface.s2` passes).
- [ ] Color contrast ≥ 3:1 for large text (`ink.60` on `surface.s2` passes for >18px).
- [ ] **Never** use color alone to convey state. Owned/wishlist/play chips have both color *and* a label.
- [ ] All interactive elements have a visible focus ring (amber 3px halo on inputs, 2px outline on buttons).
- [ ] Hit targets ≥ 44×44 on touch surfaces (mobile bottom bar, FAB, IconButtons).
- [ ] Provide `aria-label` on icon-only buttons.
- [ ] Form errors announced via `aria-describedby` linked to the helper text.

---

## Do / Don't

✅ **Do** lean into warmth — use the amber/emerald/rust ramps liberally for accent moments.
❌ **Don't** introduce a new accent hue. If you need "info blue," use the themed `palette.info` (already defined).

✅ **Do** treat `surface.s1`–`s4` as a vertical stacking metaphor — sidebar (s1) under page (base) under card (s2) under input (s3).
❌ **Don't** randomly mix surface levels. A button on a card uses `surface.s3` for its hover, not `s4`.

✅ **Do** use `JetBrains Mono` for any number a player will compare (scores, counts, durations).
❌ **Don't** use `Bricolage Grotesque` for body — it's a display face.

✅ **Do** prefer composites (`<GameCard>`, `<FeedItem>`) over rolling your own.
❌ **Don't** style game cards/feed items inline. If you need a variant, add a prop to the composite and document it.

✅ **Do** use `<Typography variant="…">` even for one-off labels — it carries the family/size/weight automatically.
❌ **Don't** set `fontFamily` / `fontSize` in `sx`. If a token is missing, add a variant to the theme.

✅ **Do** open `design-system/preview.html` to eyeball changes against the source of truth.
❌ **Don't** trust Figma or memory. The HTML preview is the canonical visual.
