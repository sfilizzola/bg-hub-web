import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeed } from "../api/me";
import type { FeedItemDto } from "../api/me";
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import { FeedItem } from "../components/bg";

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

export function FeedPage() {
  const [items, setItems] = useState<FeedItemDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
            <Button component="a" href="/search" variant="contained" size="small" onClick={(e) => { e.preventDefault(); navigate("/search"); }}>
              Search games
            </Button>
            <Button component="a" href="/me/following" variant="outlined" size="small" onClick={(e) => { e.preventDefault(); navigate("/me/following"); }}>
              Find people
            </Button>
          </Box>
        </Alert>
      )}
      {!error && items.length > 0 && (
        <>
          <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
            {items.map((item) => {
              const actorName = item.actor.displayName ?? item.actor.username;
              const gameName = item.game?.name ?? null;
              const relativeTime = formatRelativeTime(item.createdAt);

              // Map FeedItemDto.type to FeedItem kind
              let kind: "play" | "owned" | "wishlist" | "follow" = "follow";
              switch (item.type) {
                case "PLAYLOG_CREATED":
                  kind = "play";
                  break;
                case "ADDED_TO_COLLECTION":
                  kind = "owned";
                  break;
                case "ADDED_TO_WISHLIST":
                  kind = "wishlist";
                  break;
                case "FOLLOWED_YOU":
                  kind = "follow";
                  break;
                default:
                  kind = "follow";
              }

              return (
                <FeedItem
                  key={item.id}
                  kind={kind}
                  actor={{
                    username: item.actor.username,
                    displayName: item.actor.displayName,
                    imageUrl: item.actor.imageUrl ?? undefined,
                  }}
                  time={relativeTime}
                  exactTime={item.createdAt}
                  game={
                    gameName
                      ? {
                          title: gameName,
                        }
                      : undefined
                  }
                  onClickGame={() => item.game?.id && navigate(`/games/${item.game.id}`)}
                  onClickActor={() => navigate(`/u/${item.actor.username}`)}
                />
              );
            })}
          </Box>
          {nextCursor && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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
