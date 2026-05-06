# BG Hub Design System

> **Source of truth for all visual decisions in BG Hub.**
> When creating, replacing, or changing any visual element, read this document first and use the tokens & components defined here.

The system is **cozy tabletop, warm dark mode** — felt-table greens, walnut-wood browns, candle-amber accents. Every surface should feel *liftable*, like a tile or card you could pick up.

---

## Files in this directory

| File | Purpose |
|---|---|
| `README.md` | This file — overview + rules of use |
| `tokens.md` | Full token reference (colors, type, spacing, radii, shadows) |
| `components.md` | Component specs (anatomy, variants, states, props) |
| `usage.md` | Examples, patterns, do/don't, accessibility notes |
| `preview.html` | Visual reference — open in browser to see everything rendered |

The runtime implementation lives in:

| File | Contains |
|---|---|
| `src/theme.ts` | MUI theme + exported `tokens` object |
| `src/components/bg/index.tsx` | `<GameCard>`, `<FeedItem>`, `<RatingStamp>`, `<UserCard>`, `<StatusChip>` |

---

## When you're working on BG Hub

### ✅ Always
- Use **MUI components** (`Box`, `Button`, `Card`, `Typography`…) — not raw HTML/CSS for layout.
- Pull colors from `theme.palette.*` or `tokens.*`. Never hardcode hex values.
- Pull spacing from `theme.spacing(n)` (1 unit = 4px). Never use raw `px` for padding/margin in `sx`.
- Use `Typography` variants (`display1`, `h1`, `body1`, `mono`, `score`…) — never set `fontFamily`/`fontSize` ad hoc.
- Reuse the components in `src/components/bg/` for game cards, feed items, ratings, etc.
- For new icons / illustrations, follow the **motif library** in `tokens.md` (meeple, hex, dice, token, pawn).

### ❌ Never
- Don't introduce a new color outside the amber / emerald / rust accent system. If you genuinely need a new hue, add it to `tokens.ts` first and update this README.
- Don't use light mode. Dark mode is core to the brand.
- Don't use Inter, Roboto, Arial, or system-default fonts. Use Bricolage Grotesque (display), Public Sans (UI), JetBrains Mono (numeric).
- Don't reproduce or recreate other apps' (e.g. Untappd's, BGG's) UI patterns 1:1. We're inspired by the *category*, not by their proprietary look.
- Don't use raw rounded-rectangle drop shadows. Use `theme.shadows[1..24]` which map to our warm e1–e4 elevation scale.

---

## Quick-reference cheat sheet

```tsx
import { Button, Card, Typography, Box, Stack } from "@mui/material";
import { tokens } from "@/theme";
import { GameCard, FeedItem, RatingStamp, UserCard, StatusChip } from "@/components/bg";

// Page background already set via CssBaseline.
<Box sx={{ p: 6, bgcolor: "surface.s1" }}>
  <Typography variant="display2">Around the table</Typography>
  <Typography variant="body1" color="text.secondary">A cozy place to log every play.</Typography>

  <Stack direction="row" spacing={2} mt={4}>
    <Button variant="contained">Add to Owned</Button>           {/* amber primary */}
    <Button variant="contained" color="secondary">Wishlist</Button> {/* emerald */}
    <Button variant="text">Cancel</Button>
  </Stack>
</Box>
```

| I want to… | Use |
|---|---|
| Page background | already on `<body>` via `CssBaseline` |
| Section / card surface | `bgcolor: "surface.s2"` (or `<Card>`) |
| Sidebar / header | `bgcolor: "surface.s1"` |
| Subtle inset (input bg, hover) | `bgcolor: "surface.s3"` |
| Border / divider | `border: 1, borderColor: "surface.s3"` (or `<Divider>`) |
| Heading text | `<Typography variant="h1\|h2\|display1">` |
| Body text | `<Typography variant="body1">` |
| Score / numeric stat | `<Typography variant="mono\|score">` |
| Eyebrow label | `<Typography variant="eyebrow">` |
| Primary CTA | `<Button variant="contained">` |
| "Owned" / felt action | `<Button variant="contained" color="secondary">` |
| Destructive | `<Button color="error">` |
| Status pill | `<StatusChip status="owned\|wishlist\|played\|new" />` |
| Game tile | `<GameCard>` |
| Feed event | `<FeedItem kind="play\|owned\|wishlist">` |
| Rating medallion | `<RatingStamp score={8.4}>` |

---

## Setup (already done)

1. `src/theme.ts` exports the MUI theme + tokens.
2. `src/main.tsx` (or `App.tsx`) wraps the app in `<ThemeProvider theme={theme}><CssBaseline />…`.
3. `index.html` `<head>` loads the three Google Fonts:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
   ```

That's it. Read `tokens.md` and `components.md` before changing visual code.
