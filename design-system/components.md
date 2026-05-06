# Components

Two layers:

1. **MUI primitives** — themed via `src/theme.ts`. Use these for everything: `Button`, `TextField`, `Card`, `Chip`, `Tabs`, `Dialog`, `Drawer`, `List`, `Avatar`, `Tooltip`, etc.
2. **BG Hub composites** — domain-specific components in `src/components/bg/index.tsx`. Use these for game cards, feed events, and ratings rather than rebuilding them.

---

## MUI primitives — recipes

### Button

```tsx
<Button variant="contained">Add to Owned</Button>            {/* amber, primary CTA */}
<Button variant="contained" color="secondary">Wishlist</Button> {/* emerald felt */}
<Button variant="outlined">Follow</Button>                    {/* warm outline */}
<Button variant="text">Cancel</Button>                        {/* ghost */}
<Button variant="contained" color="error">Remove</Button>     {/* rust danger */}

<Button size="small">…</Button>   {/* 28px tall */}
<Button size="large">…</Button>   {/* 48px tall */}
<IconButton><AddIcon /></IconButton>
```

States are themed automatically (hover/active/focus/disabled). Don't override colors with `sx` — pick the right variant.

### TextField / inputs

```tsx
<TextField label="Username" defaultValue="marta" helperText="bghub.app/u/marta" />
<TextField label="Notes" multiline rows={3} />
<TextField label="Result" error helperText="Result is required." />
```

The OutlinedInput is themed: amber focus ring, rust error ring, surface.s3 background.

### Card

```tsx
<Card>
  <CardContent>
    <Typography variant="h2">Recently played</Typography>
    …
  </CardContent>
</Card>
```

`<Card>` already gives you `surface.s2` + `surface.s3` border + `r/lg` + `e1`. Use `elevation={2}` for hover-lift, `elevation={4}` for floating.

### Tabs

```tsx
<Tabs value={tab} onChange={(_, v) => setTab(v)}>
  <Tab label={<><span>Owned</span> <Box component="span" sx={{ fontFamily: "mono", color: "ink.40", ml: 1 }}>247</Box></>} />
  <Tab label="Wishlist" />
  <Tab label="Plays" />
</Tabs>
```

Amber underline indicator. Use Bricolage 600 for tab labels.

### Drawer (sidebar)

```tsx
<Drawer variant="permanent" sx={{ width: 280, "& .MuiDrawer-paper": { width: 280 } }}>
  <List dense>
    <ListSubheader>Home</ListSubheader>
    <ListItemButton selected>
      <ListItemIcon>⌂</ListItemIcon>
      <ListItemText primary="Feed" />
    </ListItemButton>
    <ListSubheader>My collection</ListSubheader>
    <ListItemButton>
      <ListItemIcon sx={{ color: "secondary.light" }}>●</ListItemIcon>
      <ListItemText primary="Owned" />
      <Typography variant="mono" color="ink.40">247</Typography>
    </ListItemButton>
  </List>
</Drawer>
```

`Mui-selected` shows the amber rail on the left automatically.

### Chip

```tsx
<Chip label="Owned" color="secondary" size="small" />     {/* emerald */}
<Chip label="Wishlist" color="error" size="small" />      {/* rust */}
<Chip label="Strategy" variant="outlined" size="small" /> {/* category tag */}
```

Or use the `<StatusChip>` composite for the canonical owned/wishlist/played pills.

### Dialog (modal)

```tsx
<Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
  <DialogTitle>Log a play</DialogTitle>
  <DialogContent>…</DialogContent>
  <DialogActions>
    <Button variant="text" onClick={close}>Cancel</Button>
    <Button variant="contained">Save play</Button>
  </DialogActions>
</Dialog>
```

The themed Dialog has `r/xl`, `surface.s1` paper, `e4` shadow, blurred backdrop.

---

## BG Hub composites

Located in `src/components/bg/index.tsx`. **Prefer these over rolling your own.**

### `<RatingStamp />`

The wax-seal medallion. /10 numeric score on amber gradient.

```tsx
<RatingStamp score={8.4} size={56} showCap={false} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `score` | `number` | required | 0–10. Rendered with one decimal. |
| `size` | `number` | `56` | Pixel width/height. |
| `showCap` | `boolean` | `false` | Show "/10" label below number. Use at sizes ≥ 100px. |
| `sx` | `SxProps` | – | |

### `<GameCard />`

Boardgame trading-card tile.

```tsx
<GameCard
  title="Ark Nova"
  year={2021}
  score={9.1}
  players="1–4"
  playTime="90–150m"
  bggRating={8.5}
  tags={["Heavy", "Tableau"]}
  status="owned"            // "none" | "owned" | "wishlist"
  imageUrl={game.imageUrl}  // optional — falls back to striped placeholder
  onAddOwned={…}
  onAddWishlist={…}
  onLogPlay={…}
/>
```

Anatomy: cover (5:3) → year tag (top-left) → status flag (top-right, if owned/wishlisted) → score stamp (overlapping body) → title → mono meta line (players · time · ★ rating) → category tags → CTA row.

### `<FeedItem />`

Single feed event (PlayLog / Owned add / Wishlist add).

```tsx
<FeedItem
  kind="play"               // "play" | "owned" | "wishlist"
  actor={{ username: "liam", avatarColor: ["#3F8A5A", "#1F4F37"] }}
  time="2h ago"
  withUsers={["marta", "ana"]}  // optional, only meaningful for plays
  game={{
    title: "Ark Nova",
    sub: "4 players · 142 min",
    score: 9.1,
  }}
  note="Marta closed it out with a pelican lock."  // optional, only for plays
/>
```

`kind` drives the verb, the kind chip color, and the under-tag inside the actor line.

### `<UserCard />`

Profile card for a user. Warm gradient banner, stats row, follow/view actions.

```tsx
<UserCard
  name="Marta Vega"
  handle="marta"
  pronouns="she/her"
  bio="Heavy euros & word games. Always down for a 4-player Ark Nova."
  avatarColor={["#F0A830", "#C2553D"]}
  stats={{ owned: 247, wishlist: 38, plays: 1204 }}
  onFollow={…}
  onView={…}
/>
```

### `<StatusChip />`

```tsx
<StatusChip status="owned" />
<StatusChip status="wishlist" />
<StatusChip status="played" count={12} />  // "Played 12×"
<StatusChip status="new" />
```

---

## What to build (vs. reuse)

| If you're rendering… | Use |
|---|---|
| A single game in a list/grid | `<GameCard>` |
| A row in the home feed | `<FeedItem>` |
| A score / rating | `<RatingStamp>` |
| A profile header | `<UserCard>` |
| Owned/Wishlist/Played pill | `<StatusChip>` |
| Anything else | MUI primitives + themed `sx` |

If a new pattern recurs **3+ times** in the app, lift it into `src/components/bg/` and document it here.
