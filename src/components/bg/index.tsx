import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system/styleFunctionSx";
import { tokens } from "@/theme";

// ============================================================================
// RatingStamp
// ============================================================================
// Wax-seal medallion with score.

interface RatingStampProps {
  score: number;
  size?: number;
  showCap?: boolean;
  sx?: SxProps<Theme>;
}

export function RatingStamp({ score, size = 56, showCap = false, sx }: RatingStampProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${tokens.amber[500]} 0%, ${tokens.amber[300]} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        boxShadow: `0 4px 12px rgba(240, 168, 48, 0.3)`,
        ...sx,
      }}
    >
      <Typography
        variant="score"
        sx={{
          color: "white",
          textAlign: "center",
        }}
      >
        {score.toFixed(1)}
      </Typography>
      {showCap && (
        <Typography
          variant="caption"
          sx={{
            color: "white",
            fontSize: "0.65rem",
          }}
        >
          /10
        </Typography>
      )}
    </Box>
  );
}

// ============================================================================
// StatusChip
// ============================================================================
// Owned / Wishlist / Played / New status pill.

interface StatusChipProps {
  status: "owned" | "wishlist" | "played" | "new";
  count?: number;
  sx?: SxProps<Theme>;
}

export function StatusChip({ status, count, sx }: StatusChipProps) {
  const statusConfig = {
    owned: { label: "Owned", color: "secondary" as const },
    wishlist: { label: "Wishlist", color: "error" as const },
    played: {
      label: count !== undefined ? `Played ${count}×` : "Played",
      color: "default" as const,
      textColor: tokens.amber[500],
    },
    new: {
      label: "New",
      color: "default" as const,
      textColor: tokens.ink[60],
    },
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        ...(config.textColor && { color: config.textColor }),
        ...sx,
      }}
    />
  );
}

// ============================================================================
// GameCard
// ============================================================================
// Trading-card game tile.

interface GameCardProps {
  title: string;
  year?: number | null;
  score?: number | null;
  players?: string | null;
  playTime?: number | null;
  bggRating?: number | null;
  tags?: string[];
  status?: "none" | "owned" | "wishlist";
  imageUrl?: string | null;
  onAddOwned?: () => void;
  onAddWishlist?: () => void;
  onLogPlay?: () => void;
  onRemove?: () => void;
  removing?: boolean;
  loading?: boolean;
  sx?: SxProps<Theme>;
}

const CARD_WIDTH = 180;
const COVER_ASPECT = 5 / 3;

export function GameCard({
  title,
  year,
  score,
  players,
  playTime,
  bggRating,
  tags,
  status = "none",
  imageUrl,
  onAddOwned,
  onAddWishlist,
  onLogPlay,
  onRemove,
  removing = false,
  loading = false,
  sx,
}: GameCardProps) {
  if (loading) {
    return (
      <Card sx={{ width: CARD_WIDTH, ...sx }}>
        <Skeleton variant="rectangular" height={CARD_WIDTH / COVER_ASPECT} />
        <CardContent>
          <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="80%" />
        </CardContent>
      </Card>
    );
  }

  const coverHeight = CARD_WIDTH / COVER_ASPECT;
  const metaItems = [];
  if (year) metaItems.push(String(year));
  if (players) metaItems.push(players);
  if (playTime) metaItems.push(`${playTime}m`);
  if (bggRating) metaItems.push(`★ ${bggRating.toFixed(1)}`);
  const metaLine = metaItems.join(" · ");

  return (
    <Card
      sx={{
        width: CARD_WIDTH,
        position: "relative",
        overflow: "visible",
        ...sx,
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: coverHeight,
          background: imageUrl
            ? `url(${imageUrl}) center / cover`
            : `linear-gradient(135deg, ${tokens.surface.s3} 0%, ${tokens.surface.s4} 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Year Tag (top-left) */}
        {year && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: tokens.ink[100],
              px: 1,
              py: 0.5,
              borderRadius: tokens.radius.sm,
            }}
          >
            <Typography variant="caption">{year}</Typography>
          </Box>
        )}

        {/* Status Flag (top-right) */}
        {status !== "none" && (
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <StatusChip status={status === "owned" ? "owned" : "wishlist"} />
          </Box>
        )}

        {/* Score Stamp (bottom-right, overlapping) */}
        {score && (
          <Box
            sx={{
              position: "absolute",
              bottom: -16,
              right: 8,
              zIndex: 10,
            }}
          >
            <RatingStamp score={score} size={48} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ pb: 1 }}>
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            mt: score ? 2.5 : 0,
            mb: 1,
            minHeight: "2.2em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </Typography>

        {/* Meta Line */}
        {metaLine && (
          <Typography
            variant="mono"
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {metaLine}
          </Typography>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mb: 2,
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            {tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                size="small"
                sx={{
                  height: 24,
                  fontSize: "0.7rem",
                }}
              />
            ))}
          </Stack>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          gap: 0.5,
          p: 1,
          pt: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {status === "none" && (
          <>
            <Button
              size="small"
              variant="contained"
              onClick={onAddOwned}
              disabled={!onAddOwned}
            >
              Owned
            </Button>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={onAddWishlist}
              disabled={!onAddWishlist}
            >
              Wishlist
            </Button>
          </>
        )}
        {status === "owned" && onRemove && (
          <>
            <Button
              size="small"
              variant="text"
              onClick={onLogPlay}
              disabled={!onLogPlay || removing}
            >
              Log Play
            </Button>
            <Button
              size="small"
              color="error"
              onClick={onRemove}
              disabled={removing}
            >
              {removing ? (
                <CircularProgress size={16} />
              ) : (
                "Remove"
              )}
            </Button>
          </>
        )}
        {status === "wishlist" && onRemove && (
          <Button
            size="small"
            color="error"
            onClick={onRemove}
            disabled={removing}
            sx={{
              gridColumn: "1 / -1",
            }}
          >
            {removing ? <CircularProgress size={16} /> : "Remove"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

// ============================================================================
// FeedItem
// ============================================================================
// Single feed event row (play, owned add, wishlist add, follow).

interface FeedItemActorProps {
  username: string;
  displayName?: string | null;
  imageUrl?: string | null;
  avatarColor?: [string, string];
}

interface FeedItemGameProps {
  title: string;
  sub?: string;
  score?: number | null;
}

interface FeedItemProps {
  kind: "play" | "owned" | "wishlist" | "follow";
  actor: FeedItemActorProps;
  time: string;
  exactTime?: string;
  withUsers?: string[];
  game?: FeedItemGameProps;
  note?: string;
  onClickGame?: () => void;
  onClickActor?: () => void;
  sx?: SxProps<Theme>;
}

const kindConfig = {
  play: { verb: "logged a play of", chipStatus: "played" as const, color: tokens.amber[500] },
  owned: { verb: "added to Owned", chipStatus: "owned" as const, color: tokens.emerald[500] },
  wishlist: { verb: "added to Wishlist", chipStatus: "wishlist" as const, color: tokens.rust[500] },
  follow: { verb: "followed you", chipStatus: "new" as const, color: tokens.ink[60] },
};

export function FeedItem({
  kind,
  actor,
  time,
  exactTime,
  withUsers,
  game,
  note,
  onClickGame,
  onClickActor,
  sx,
}: FeedItemProps) {
  const config = kindConfig[kind];
  const actorName = actor.displayName || actor.username;

  const avatarBg = actor.avatarColor
    ? `linear-gradient(135deg, ${actor.avatarColor[0]} 0%, ${actor.avatarColor[1]} 100%)`
    : actor.imageUrl
      ? `url(${actor.imageUrl}) center / cover`
      : `linear-gradient(135deg, ${tokens.amber[500]} 0%, ${tokens.emerald[500]} 100%)`;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${tokens.surface.edge}`,
        alignItems: "flex-start",
        ...sx,
      }}
    >
      {/* Actor Avatar */}
      <Avatar
        sx={{
          width: 40,
          height: 40,
          background: avatarBg,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Actor + Verb + Kind Chip */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
          <Typography
            component={onClickActor ? "button" : "span"}
            variant="body2"
            onClick={onClickActor}
            sx={{
              fontWeight: 600,
              cursor: onClickActor ? "pointer" : "default",
              textDecoration: onClickActor ? "underline" : "none",
              border: "none",
              background: "none",
              p: 0,
              color: "text.primary",
              "&:hover": onClickActor ? { opacity: 0.8 } : {},
            }}
          >
            {actorName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {config.verb}
          </Typography>
          <StatusChip status={config.chipStatus} />
        </Box>

        {/* Time */}
        <Typography
          variant="caption"
          color="text.secondary"
          title={exactTime}
          sx={{ cursor: exactTime ? "help" : "default" }}
        >
          {time}
        </Typography>

        {/* Game Info */}
        {game && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography
                component={onClickGame ? "button" : "span"}
                variant="body2"
                onClick={onClickGame}
                sx={{
                  fontWeight: 600,
                  cursor: onClickGame ? "pointer" : "default",
                  textDecoration: onClickGame ? "underline" : "none",
                  border: "none",
                  background: "none",
                  p: 0,
                  color: "text.primary",
                  "&:hover": onClickGame ? { opacity: 0.8 } : {},
                }}
              >
                {game.title}
              </Typography>
              {game.score && <RatingStamp score={game.score} size={32} />}
            </Box>
            {game.sub && (
              <Typography variant="caption" color="text.secondary">
                {game.sub}
              </Typography>
            )}
          </Box>
        )}

        {/* With Users */}
        {withUsers && withUsers.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", my: 1 }}>
            with {withUsers.join(", ")}
          </Typography>
        )}

        {/* Note */}
        {note && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            "{note}"
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ============================================================================
// UserCard
// ============================================================================
// Profile card with avatar, stats, and follow/view actions.

interface UserCardStatsProps {
  owned: number;
  wishlist: number;
  plays: number;
}

interface UserCardProps {
  name: string;
  handle: string;
  pronouns?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  avatarColor?: [string, string];
  stats: UserCardStatsProps;
  isFollowing?: boolean;
  followsYou?: boolean;
  onFollow?: () => void;
  onView?: () => void;
  loading?: boolean;
  sx?: SxProps<Theme>;
}

export function UserCard({
  name,
  handle,
  pronouns,
  bio,
  avatarUrl,
  avatarColor,
  stats,
  isFollowing = false,
  followsYou = false,
  onFollow,
  onView,
  loading = false,
  sx,
}: UserCardProps) {
  if (loading) {
    return (
      <Card sx={{ maxWidth: 320, ...sx }}>
        <Skeleton variant="rectangular" height={120} />
        <CardContent>
          <Skeleton variant="circular" width={64} height={64} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="60%" />
        </CardContent>
      </Card>
    );
  }

  const avatarBg = avatarColor
    ? `linear-gradient(135deg, ${avatarColor[0]} 0%, ${avatarColor[1]} 100%)`
    : avatarUrl
      ? `url(${avatarUrl}) center / cover`
      : `linear-gradient(135deg, ${tokens.amber[500]} 0%, ${tokens.rust[500]} 100%)`;

  return (
    <Card sx={{ maxWidth: 320, ...sx }}>
      {/* Gradient Banner */}
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${tokens.surface.s3} 0%, ${tokens.surface.s4} 100%)`,
        }}
      />

      <CardContent
        sx={{
          textAlign: "center",
          pb: 1,
          position: "relative",
          pt: -8,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: avatarBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mx: "auto",
            mb: 2,
            border: `3px solid ${tokens.surface.s2}`,
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
          }}
        />

        {/* Name */}
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          {name}
        </Typography>

        {/* Handle + Pronouns */}
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            @{handle}
          </Typography>
          {pronouns && (
            <Typography variant="body2" color="text.secondary">
              {pronouns}
            </Typography>
          )}
        </Stack>

        {/* Bio */}
        {bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {bio}
          </Typography>
        )}

        {/* Stats Grid */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-around"
          sx={{
            p: 1.5,
            bgcolor: tokens.surface.s3,
            borderRadius: tokens.radius.md,
            mb: 2,
          }}
        >
          {[
            { label: "Owned", value: stats.owned },
            { label: "Wishlist", value: stats.wishlist },
            { label: "Plays", value: stats.plays },
          ].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: "center" }}>
              <Typography variant="mono" sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 0.25 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption">{stat.label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* Badges */}
        {followsYou && (
          <Chip
            label="Follows you"
            size="small"
            variant="outlined"
            sx={{ mb: 2, mr: 1 }}
          />
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ gap: 1, justifyContent: "center", pb: 2 }}>
        {onFollow && (
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            color={isFollowing ? "inherit" : "primary"}
            onClick={onFollow}
            size="small"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
        {onView && (
          <Button variant="text" onClick={onView} size="small">
            View Profile
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
