import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed } from "../api/me";
import type { FeedItemDto } from "../api/me";
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";

/** Format ISO date string as relative time (e.g. "2 hours ago"). */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

/** Format ISO date for tooltip (exact date/time). */
function formatExactTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Render feed item text with actor, targetUser, and game as links. */
function FeedItemContent({ item }: Readonly<{ item: FeedItemDto }>) {
  const { type, actor, targetUser, game, text } = item;
  const actorDisplay = actor.displayName ?? actor.username;
  const targetDisplay = targetUser ? (targetUser.displayName ?? targetUser.username) : null;
  const gameName = game?.name ?? null;

  // Build content with links; fallback to plain text if we don't handle the type
  const content = (() => {
    switch (type) {
      case "FOLLOWED_YOU":
        return (
          <>
            <Link to={`/u/${actor.username}`} style={{ fontWeight: 600, color: "inherit" }}>
              {actorDisplay}
            </Link>
            {" followed you"}
          </>
        );
      case "YOU_FOLLOWED":
        return targetUser ? (
          <>
            {"You followed "}
            <Link to={`/u/${targetUser.username}`} style={{ fontWeight: 600, color: "inherit" }}>
              {targetDisplay}
            </Link>
          </>
        ) : (
          <>You followed someone</>
        );
      case "ADDED_TO_WISHLIST":
        return (
          <>
            <Link to={`/u/${actor.username}`} style={{ fontWeight: 600, color: "inherit" }}>
              {actorDisplay}
            </Link>
            {" added "}
            {game?.id ? (
              <Link to={`/games/${game.id}`} style={{ fontWeight: 600, color: "inherit" }}>
                {gameName}
              </Link>
            ) : (
              gameName ?? "a game"
            )}
            {" to wishlist"}
          </>
        );
      case "ADDED_TO_COLLECTION":
        return (
          <>
            <Link to={`/u/${actor.username}`} style={{ fontWeight: 600, color: "inherit" }}>
              {actorDisplay}
            </Link>
            {" added "}
            {game?.id ? (
              <Link to={`/games/${game.id}`} style={{ fontWeight: 600, color: "inherit" }}>
                {gameName}
              </Link>
            ) : (
              gameName ?? "a game"
            )}
            {" to collection"}
          </>
        );
      case "PLAYLOG_CREATED":
        return (
          <>
            <Link to={`/u/${actor.username}`} style={{ fontWeight: 600, color: "inherit" }}>
              {actorDisplay}
            </Link>
            {" logged a play of "}
            {game?.id ? (
              <Link to={`/games/${game.id}`} style={{ fontWeight: 600, color: "inherit" }}>
                {gameName}
              </Link>
            ) : (
              gameName ?? "a game"
            )}
          </>
        );
      default:
        return text;
    }
  })();

  return <Typography component="span" variant="body1">{content}</Typography>;
}

export function FeedPage() {
  const [items, setItems] = useState<FeedItemDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (cursor?: string) => {
    const isFirst = cursor == null;
    if (isFirst) {
      setLoading(true);
      setError("");
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await getFeed({ limit: 20, cursor });
      setItems((prev) => {
        const byId = new Map(prev.map((i) => [i.id, i]));
        res.items.forEach((i) => byId.set(i.id, i));
        return Array.from(byId.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setNextCursor(res.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) load(nextCursor);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading feed…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
        Feed
      </Typography>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => load()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {!error && items.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1 }}>No activity yet.</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button component={Link} to="/search" variant="contained" size="small">
              Search games
            </Button>
            <Button component={Link} to="/me/following" variant="outlined" size="small">
              Find people
            </Button>
          </Box>
        </Alert>
      )}
      {!error && items.length > 0 && (
        <>
          <List disablePadding sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {items.map((item, index) => (
              <Box key={item.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      src={item.actor.imageUrl ?? undefined}
                      sx={{ width: 36, height: 36 }}
                      component={Link}
                      to={`/u/${item.actor.username}`}
                    >
                      {(item.actor.displayName ?? item.actor.username).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<FeedItemContent item={item} />}
                    secondary={
                      <Tooltip title={formatExactTime(item.createdAt)} placement="top">
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ cursor: "default" }}
                        >
                          {formatRelativeTime(item.createdAt)}
                        </Typography>
                      </Tooltip>
                    }
                    primaryTypographyProps={{ component: "span" }}
                    secondaryTypographyProps={{ component: "span", display: "block", sx: { mt: 0.25 } }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
          {nextCursor && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
