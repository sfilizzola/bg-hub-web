/**
 * BG Hub — Reusable MUI components.
 * Drop in src/components/bg/. Import { GameCard, FeedItem, RatingStamp } from '@/components/bg'.
 *
 * All components consume the theme exported from src/theme.ts — no extra setup needed
 * other than wrapping your app in <ThemeProvider theme={theme}><CssBaseline />…</ThemeProvider>.
 */

import * as React from "react";
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Avatar, AvatarGroup,
} from "@mui/material";
import { alpha, useTheme, type SxProps, type Theme } from "@mui/material/styles";
import { tokens } from "../theme";

/* =================================================================== */
/* RatingStamp                                                          */
/* The wax-seal medallion. /10 score in mono, on an amber gradient.    */
/* =================================================================== */

export interface RatingStampProps {
  /** 0–10 score */
  score: number;
  /** Visual size in px (default 56) */
  size?: number;
  /** Show "/10" cap label below number */
  showCap?: boolean;
  sx?: SxProps<Theme>;
}

export function RatingStamp({ score, size = 56, showCap = false, sx }: RatingStampProps) {
  const display = score.toFixed(1);
  const numberSize = Math.round(size * 0.32);
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${tokens.amber[400]}, ${tokens.amber[600]})`,
        border: "2px solid",
        borderColor: "surface.s1",
        boxShadow: tokens.shadow.e2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.font.mono,
          fontWeight: 700,
          fontSize: `${numberSize}px`,
          color: "#1A1410",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {display}
      </Typography>
      {showCap && (
        <Typography
          sx={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: tokens.font.mono,
            fontSize: 10,
            fontWeight: 600,
            color: "#3A2916",
          }}
        >
          /10
        </Typography>
      )}
    </Box>
  );
}

/* =================================================================== */
/* GameCard                                                             */
/* The boardgame trading card: cover, year, stamp, title, meta, tags.  */
/* =================================================================== */

export interface GameCardProps {
  title: string;
  year?: number | string;
  /** /10 community score */
  score?: number;
  /** Players range, e.g. "1–5" */
  players?: string;
  /** Play time, e.g. "40–70m" */
  playTime?: string;
  /** BGG-style numeric rating (e.g. ★ 7.9) */
  bggRating?: number;
  imageUrl?: string;
  tags?: string[];
  status?: "none" | "owned" | "wishlist";
  onAddOwned?: () => void;
  onAddWishlist?: () => void;
  onLogPlay?: () => void;
  sx?: SxProps<Theme>;
}

export function GameCard({
  title, year, score, players, playTime, bggRating,
  imageUrl, tags = [], status = "none",
  onAddOwned, onAddWishlist, onLogPlay, sx,
}: GameCardProps) {
  const isOwned = status === "owned";
  const isWish = status === "wishlist";

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform .15s, box-shadow .15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadow.e2 },
        ...sx,
      }}
    >
      {/* Cover */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "5/3",
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : `linear-gradient(135deg, ${tokens.surface.s3}, ${tokens.surface.s4})`,
          borderBottom: `1px solid ${tokens.surface.s3}`,
          overflow: "hidden",
        }}
      >
        {!imageUrl && (
          <Box
            sx={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1,
              color: "ink.40",
              fontFamily: tokens.font.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 8px, transparent 8px 16px)",
            }}
          >
            <Box component="svg" viewBox="0 0 100 100" sx={{ width: 60, height: 60 }}>
              <polygon points="50,8 88,30 88,70 50,92 12,70 12,30" fill="none" stroke={tokens.ink[80]} strokeWidth="2.5" />
              <polygon points="50,28 70,40 70,60 50,72 30,60 30,40" fill={tokens.ink[80]} opacity=".7" />
            </Box>
            <span>game cover</span>
          </Box>
        )}

        {year && (
          <Box
            sx={{
              position: "absolute", top: 10, left: 12,
              fontFamily: tokens.font.mono, fontSize: 11, color: "ink.80",
              bgcolor: "rgba(0,0,0,.4)", px: 1.5, py: 0.5, borderRadius: 1,
            }}
          >
            {year}
          </Box>
        )}

        {(isOwned || isWish) && (
          <Box
            sx={{
              position: "absolute", top: 10, right: 12,
              fontSize: 11, fontWeight: 700,
              color: isOwned ? tokens.emerald[200] : tokens.rust[200],
              bgcolor: isOwned ? tokens.emerald[700] : tokens.rust[700],
              px: 2, py: 0.5, borderRadius: 1, letterSpacing: "0.04em",
            }}
          >
            {isOwned ? "Owned" : "Wishlist"}
          </Box>
        )}

        {isOwned && (
          <Box
            sx={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(135deg, transparent 60%, ${alpha(tokens.emerald[500], 0.18)})`,
            }}
          />
        )}
      </Box>

      {/* Body */}
      <CardContent sx={{ position: "relative", pt: 4.5, pb: 4 }}>
        {score !== undefined && (
          <Box sx={{ position: "absolute", top: -28, right: 14 }}>
            <RatingStamp score={score} size={56} />
          </Box>
        )}

        <Typography variant="h2" sx={{ fontSize: 20, mb: 1.5, pr: 8, lineHeight: 1.15 }}>
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            fontFamily: tokens.font.mono,
            fontSize: 12,
            color: "ink.60",
            mb: 3,
          }}
        >
          {players && <span>{players}</span>}
          {players && (playTime || bggRating !== undefined) && <span>·</span>}
          {playTime && <span>{playTime}</span>}
          {playTime && bggRating !== undefined && <span>·</span>}
          {bggRating !== undefined && <span>★ {bggRating.toFixed(1)}</span>}
        </Stack>

        {tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
            {tags.map(t => (
              <Chip
                key={t}
                label={t}
                size="small"
                variant="outlined"
                sx={{
                  bgcolor: "surface.s2",
                  borderColor: "surface.s3",
                  color: "ink.80",
                  height: 22,
                  fontSize: 12,
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={1}>
          {isOwned ? (
            <Button size="small" color="secondary" variant="contained" disabled>In your shelf</Button>
          ) : (
            <Button size="small" variant="contained" onClick={onAddOwned}>+ Owned</Button>
          )}
          {!isWish && !isOwned && (
            <Button size="small" variant="text" onClick={onAddWishlist}>Wishlist</Button>
          )}
          {(isOwned || isWish) && onLogPlay && (
            <Button size="small" variant="text" onClick={onLogPlay}>Log play</Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =================================================================== */
/* FeedItem                                                             */
/* A single feed entry: actor + action + game (+ note for plays).      */
/* =================================================================== */

export type FeedKind = "play" | "owned" | "wishlist";

export interface FeedItemProps {
  actor: { username: string; avatarColor?: [string, string]; initial?: string };
  kind: FeedKind;
  /** Relative time, e.g. "2h ago" */
  time: string;
  /** Tagged players for plays */
  withUsers?: string[];
  game: {
    title: string;
    /** Sub-line, e.g. "2018 · 2–4 players · ★ 8.6" */
    sub?: string;
    score?: number;
  };
  /** Free-text note shown for play logs */
  note?: string;
  sx?: SxProps<Theme>;
}

const kindConfig: Record<FeedKind, { label: string; verb: React.ReactNode; color: keyof Pick<Theme["palette"], "amber" | "emerald" | "rust"> }> = {
  play:     { label: "Played",   verb: "logged a play", color: "amber" },
  owned:    { label: "Owned",    verb: <>added to <UnderTag color="emerald">Owned</UnderTag></>,    color: "emerald" },
  wishlist: { label: "Wishlist", verb: <>added to <UnderTag color="rust">Wishlist</UnderTag></>, color: "rust" },
};

function UnderTag({ color, children }: { color: "emerald" | "rust"; children: React.ReactNode }) {
  const c = color === "emerald" ? tokens.emerald : tokens.rust;
  return (
    <Box component="span" sx={{ display: "inline-block", px: 1.5, py: 0.25, borderRadius: 1, fontSize: 13, fontWeight: 600, bgcolor: alpha(c[500], 0.18), color: c[300] }}>
      {children}
    </Box>
  );
}

export function FeedItem({ actor, kind, time, withUsers, game, note, sx }: FeedItemProps) {
  const cfg = kindConfig[kind];
  const ramp = cfg.color === "amber" ? tokens.amber : cfg.color === "emerald" ? tokens.emerald : tokens.rust;
  const initial = (actor.initial ?? actor.username[0] ?? "?").toUpperCase();
  const [c1, c2] = actor.avatarColor ?? [tokens.amber[500], tokens.rust[500]];

  return (
    <Card sx={{ p: 4, ...sx }}>
      {/* Head */}
      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 3, mb: 3 }}>
        <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
          {initial}
        </Avatar>
        <Box>
          <Typography sx={{ color: "ink.100", fontSize: 14 }}>
            <strong>{actor.username}</strong> {cfg.verb}
          </Typography>
          <Typography sx={{ color: "ink.40", fontSize: 12, mt: 0.5 }}>
            {time}{withUsers && withUsers.length > 0 ? ` · with ${withUsers.join(", ")}` : ""}
          </Typography>
        </Box>
        <Box
          sx={{
            fontSize: 11, fontWeight: 700, px: 2, py: 1, borderRadius: 1,
            letterSpacing: "0.06em", textTransform: "uppercase",
            bgcolor: alpha(ramp[500], 0.15),
            color: ramp[300],
            border: `1px solid ${ramp[700]}`,
          }}
        >
          {cfg.label}
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ bgcolor: "surface.s3", borderRadius: 2, p: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 3.5 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 1, flexShrink: 0,
              background: `linear-gradient(135deg, ${tokens.surface.s4}, ${tokens.surface.edge})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Box component="svg" viewBox="0 0 40 40" sx={{ width: 32, height: 32 }}>
              <rect x="6" y="6" width="28" height="28" rx="4" fill={tokens.ink[80]} opacity=".7" />
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: tokens.font.display, fontWeight: 600, fontSize: 16, color: "ink.100", lineHeight: 1.2, mb: 0.5 }}>
              {game.title}
            </Typography>
            {game.sub && (
              <Typography sx={{ fontSize: 12, color: "ink.60" }}>{game.sub}</Typography>
            )}
          </Box>
          {game.score !== undefined && <RatingStamp score={game.score} size={40} />}
        </Box>

        {note && (
          <Typography
            sx={{
              fontSize: 14, color: "ink.80", mt: 3, pt: 2.5,
              borderTop: `1px dashed ${tokens.surface.edge}`,
              fontStyle: "italic",
            }}
          >
            "{note}"
          </Typography>
        )}
      </Box>
    </Card>
  );
}

/* =================================================================== */
/* UserCard — bonus: matches the design system user card               */
/* =================================================================== */

export interface UserCardProps {
  name: string;
  handle: string;
  bio?: string;
  pronouns?: string;
  avatarInitial?: string;
  avatarColor?: [string, string];
  stats?: { owned: number; wishlist: number; plays: number };
  onFollow?: () => void;
  onView?: () => void;
  sx?: SxProps<Theme>;
}

export function UserCard({
  name, handle, bio, pronouns,
  avatarInitial, avatarColor = [tokens.amber[500], tokens.rust[500]],
  stats, onFollow, onView, sx,
}: UserCardProps) {
  const initial = (avatarInitial ?? name[0] ?? "?").toUpperCase();

  return (
    <Card sx={{ overflow: "hidden", p: 0, ...sx }}>
      <Box
        sx={{
          height: 64,
          backgroundImage: `linear-gradient(135deg, ${tokens.amber[700]}, ${tokens.rust[700]}), repeating-linear-gradient(60deg, rgba(255,255,255,.03) 0 6px, transparent 6px 12px)`,
          backgroundBlendMode: "overlay",
        }}
      />
      <Box sx={{ px: 5.5, pb: 5.5 }}>
        <Stack direction="row" spacing={3.5} alignItems="flex-end" sx={{ mt: -7 }}>
          <Avatar
            sx={{
              width: 56, height: 56, fontSize: 22,
              background: `linear-gradient(135deg, ${avatarColor[0]}, ${avatarColor[1]})`,
              boxShadow: `0 0 0 4px ${tokens.surface.s2}`,
            }}
          >
            {initial}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: tokens.font.display, fontWeight: 700, fontSize: 18, color: "ink.100" }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "ink.60" }}>
              @{handle}{pronouns ? ` · ${pronouns}` : ""}
            </Typography>
          </Box>
        </Stack>

        {bio && (
          <Typography sx={{ color: "ink.80", fontSize: 14, mt: 3.5, mb: 4, lineHeight: 1.5 }}>
            {bio}
          </Typography>
        )}

        {stats && (
          <Box
            sx={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2,
              py: 3, borderTop: `1px solid ${tokens.surface.s3}`,
              borderBottom: `1px solid ${tokens.surface.s3}`, mb: 3.5,
            }}
          >
            {([["owned", "Owned"], ["wishlist", "Wishlist"], ["plays", "Plays"]] as const).map(([k, label]) => (
              <Stack key={k} alignItems="center" spacing={0.5}>
                <Typography sx={{ fontFamily: tokens.font.mono, fontSize: 18, fontWeight: 700, color: "ink.100" }}>
                  {stats[k].toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "ink.40", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          <Button size="small" variant="contained" sx={{ flex: 1 }} onClick={onFollow}>Follow</Button>
          <Button size="small" variant="text" sx={{ flex: 1 }} onClick={onView}>View shelf</Button>
        </Stack>
      </Box>
    </Card>
  );
}

/* =================================================================== */
/* StatusChip — small helper for Owned / Wishlist / Played pills       */
/* =================================================================== */

export function StatusChip({ status, count }: { status: "owned" | "wishlist" | "played" | "new"; count?: number }) {
  const map = {
    owned:    { label: "Owned",   color: "emerald" as const, ramp: tokens.emerald },
    wishlist: { label: "Wishlist", color: "rust" as const,    ramp: tokens.rust },
    played:   { label: count ? `Played ${count}×` : "Played", color: "amber" as const, ramp: tokens.amber },
    new:      { label: "New",      color: "ink" as const,    ramp: { 300: tokens.ink[100], 500: tokens.ink[100], 700: tokens.surface.edge } as any },
  };
  const cfg = map[status];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: alpha(cfg.ramp[500], 0.15),
        color: cfg.ramp[300],
        border: `1px solid ${cfg.ramp[700]}`,
        height: 24,
        fontSize: 12,
        fontWeight: 600,
      }}
    />
  );
}

/* =================================================================== */
/* index helper — re-exports                                           */
/* =================================================================== */
export { tokens };
