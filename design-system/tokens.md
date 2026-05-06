# Tokens

All values are **exported from `src/theme.ts`** as the `tokens` object, and most are also reachable via `theme.palette.*`. Always reference them — never hardcode.

```ts
import { tokens } from "@/theme";
// or, inside an sx prop on an MUI component:
sx={{ bgcolor: "surface.s2", color: "ink.100" }}
```

---

## Color

### Surfaces — "the table"
Layered warm darks. Each step is the next thing you'd place on the table.

| Token | Hex | Use |
|---|---|---|
| `surface.base` | `#0F0E0C` | App background (already on `<body>`) |
| `surface.s1` | `#1A1612` | Sidebar, AppBar, header |
| `surface.s2` | `#241D18` | Card, Paper |
| `surface.s3` | `#322820` | Card hover, input background, inset |
| `surface.s4` | `#41342A` | Tile, chip, raised inner element |
| `surface.edge` | `#5B4A3C` | Borders, dividers |

### Ink — text
| Token | Hex | Use |
|---|---|---|
| `ink.100` | `#F6EFE1` | Headings, primary text |
| `ink.80` | `#DCCFB6` | Body text |
| `ink.60` | `#A89881` | Secondary text (`text.secondary`) |
| `ink.40` | `#7A6C5A` | Tertiary, hints, captions |
| `ink.20` | `#544A3E` | Disabled |

### Accents — "the lanterns"

**Amber** — primary action, highlight, warmth. (Maps to `palette.primary`.)
| 200 | 300 | 400 | 500 | 600 | 700 | 900 |
|---|---|---|---|---|---|---|
| `#FBE7C0` | `#F7D290` | `#F4BE5D` | **`#F0A830`** | `#A47828` | `#6B4A1C` | `#3A2810` |

**Emerald** — felt, owned, success. (Maps to `palette.secondary` and `palette.success`.)
| 200 | 300 | 400 | 500 | 600 | 700 | 900 |
|---|---|---|---|---|---|---|
| `#CFE7D8` | `#9BCFAE` | `#6CB185` | **`#3F8A5A`** | `#2E6B48` | `#1F4F37` | `#0F2A1D` |

**Rust** — heat, wishlist, danger. (Maps to `palette.error`.)
| 200 | 300 | 400 | 500 | 600 | 700 | 900 |
|---|---|---|---|---|---|---|
| `#F3CDC0` | `#E8A795` | `#D97F6A` | **`#C2553D`** | `#A4422E` | `#7A2F1F` | `#3A1810` |

### Semantic mapping
| Semantic | Maps to |
|---|---|
| `palette.primary` | amber/500 |
| `palette.secondary` | emerald/500 |
| `palette.success` | emerald/500 |
| `palette.error` | rust/500 |
| `palette.warning` | amber/500 (different shade) |
| `palette.info` | blue (`#5C8FBF`) — only for info banners |

---

## Typography

Three families. Always use `<Typography variant="…">`.

| Family | Token | Used for |
|---|---|---|
| `Bricolage Grotesque` | `tokens.font.display` | Display, h1–h2, h4, GameCard titles |
| `Public Sans` | `tokens.font.ui` | Body, h3, h5, h6, buttons, inputs |
| `JetBrains Mono` | `tokens.font.mono` | Scores, stats, kbd, timestamps in meta lines |

### Variant scale

| Variant | Family · Weight · Size · Line | Use |
|---|---|---|
| `display1` | Bricolage 700 · 64 · 1.05 | Hero |
| `display2` | Bricolage 700 · 48 · 1.08 | Page heading |
| `h1` | Bricolage 700 · 32 · 1.10 | Major section |
| `h2` | Bricolage 600 · 24 · 1.15 | Subsection, card title (large) |
| `h3` | Public Sans 600 · 18 · 1.30 | Component heading |
| `h4` | Bricolage 600 · 18 · 1.30 | Side card heading |
| `subtitle1` | Public Sans 500 · 17 · 1.45 | Lede |
| `body1` | Public Sans 400 · 15 · 1.55 | Default body |
| `body2` | Public Sans 400 · 13 · 1.50 | Compact body |
| `caption` | Public Sans 500 · 12 · 0.06em tracking | Small labels |
| `overline` | Public Sans 600 · 11 · uppercase · 0.10em | Section eyebrows |
| `eyebrow` ⭐ | Public Sans 600 · 12 · uppercase · 0.16em · amber/500 | Section eyebrow w/ accent |
| `mono` ⭐ | JetBrains Mono 500 · 13 | Inline numeric stats |
| `score` ⭐ | JetBrains Mono 700 · 56 · amber/500 | Big score / hero stat |

⭐ = custom variant added by our theme.

**Minimum sizes:** body 13px, UI labels 11px. Hit targets ≥ 44×44px.

---

## Spacing

`theme.spacing(n)` returns `n × 4px`. Always express padding/margin as theme units.

| Token | Spacing call | Pixels | Use |
|---|---|---|---|
| 2 | `theme.spacing(0.5)` or `0.5` in sx | 4 | Hairline gaps |
| 3 | `1` (or `2` in sx as 8) | 8 | Tight inline gap |
| 4 | `3` in sx | 12 | Component inner padding (small) |
| 5 | `4` in sx | 16 | Default block padding |
| 6 | `6` in sx | 24 | Section gap |
| 7 | `8` in sx | 32 | Large gap |
| 8 | `12` in sx | 48 | Hero padding |
| 9 | `16` in sx | 64 | Hero spacing |
| 10 | `24` in sx | 96 | Page top/bottom |

> Note: MUI's `sx={{ p: 4 }}` = `4 × 4px = 16px`. Our scale uses 4px base, so just think "px ÷ 4".

---

## Radius

| Token | Pixels | Use |
|---|---|---|
| `tokens.radius.sm` | 4 | Chips, pips, tags |
| `tokens.radius.md` ⭐ default | 8 | Buttons, inputs |
| `tokens.radius.lg` | 14 | Cards |
| `tokens.radius.xl` | 22 | Sheets, dialogs |
| `999` | full | Pills, avatars, segmented control |

---

## Elevation

Soft, warm shadows — like felt under wood. Map onto `theme.shadows[1..24]` which we've collapsed to four steps.

| Step | `theme.shadows[n]` | Use |
|---|---|---|
| flat | `0` | Default page surface |
| e1 | `1`–`4` | Resting card |
| e2 | `5`–`8` | Card hover, popover |
| e3 | `9`–`16` | Floating menu |
| e4 | `17`–`24` | Dialog, sheet |

Or pull directly: `tokens.shadow.e2`.

---

## Motifs

Iconographic vocabulary. Use these shapes for icons, empty states, decorative inks. Never invent new game-piece glyphs ad hoc.

- **Meeple** — wooden pawn silhouette. The hero shape (used in the logo mark).
- **Hex** — flat-top hexagon. The "tile."
- **D6** — rounded square with pip pattern.
- **Token** — concentric rings (chip).
- **Pawn** — chess-pawn silhouette.
- **Card** — tall rounded rectangle, optional suit notches.
- **Sand-timer** — bowtie with a center bead.

SVG sources for each are in `preview.html` — copy the `<path>` data when needed.
